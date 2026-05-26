import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markUpdateFailure, markUpdateSuccess } from './lib/update-status.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const dataPath = path.resolve(__dirname, '../static/spotle_data.json');
const artistReferencePath = path.resolve(__dirname, './data/spotle_artists_reference.json');
const sourceUrl = 'https://spotle.io/__data.json';

function toIsoDate(dateStr) {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function resolveRefs(flat, value) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < flat.length) {
    const resolved = flat[value];
    return resolved === undefined ? value : resolveRefs(flat, resolved);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(flat, entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, resolveRefs(flat, entry)])
    );
  }

  return value;
}

function parseSourceEntry(raw) {
  const soundcloud = raw.soundcloud && typeof raw.soundcloud === 'object' ? raw.soundcloud : {};
  return {
    date: toIsoDate(String(raw.date)),
    artist: String(raw.artist),
    track: typeof soundcloud.track === 'string' ? soundcloud.track : '',
    image: typeof raw.image_uri === 'string' ? raw.image_uri : '',
    soundcloudUrl: typeof soundcloud.url === 'string' ? soundcloud.url : ''
  };
}

function compareDate(a, b) {
  return a.localeCompare(b);
}

async function main() {
  const existing = JSON.parse(await readFile(dataPath, 'utf8'));
  const artistReference = JSON.parse(await readFile(artistReferencePath, 'utf8'));

  const artistMap = new Map();
  for (const artist of existing.artists ?? []) {
    artistMap.set(String(artist.artist).toLowerCase(), { ...artist });
  }

  for (const artist of artistReference) {
    const key = String(artist.artist).toLowerCase();
    const current = artistMap.get(key) ?? {};
    artistMap.set(key, { ...current, ...artist });
  }

  const response = await fetch(sourceUrl, {
    headers: {
      accept: 'application/json',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Spotle source responded with ${response.status}`);
  }

  const payload = await response.json();
  const nodes = Array.isArray(payload?.nodes) ? payload.nodes : [];
  const spotleNode = nodes[1];
  const flat = Array.isArray(spotleNode?.data) ? spotleNode.data : null;

  if (!flat?.length) {
    throw new Error('Spotle source payload did not include the expected data nodes.');
  }

  const descriptor = flat[0];
  const resolved = resolveRefs(flat, descriptor);
  const todaysDate = String(resolved.todaysDate ?? '');
  const previousDay = String(resolved.previousDay ?? '');
  const spotleNumber = Number(resolved.spotleNumber ?? 0);
  const rawEntries = [
    resolved.yesterdaysEntry,
    ...(Array.isArray(resolved.rewindEntries) ? resolved.rewindEntries : []),
    resolved.todaysEntry
  ].filter(Boolean);

  const parsedEntries = rawEntries
    .map((entry) => parseSourceEntry(entry))
    .filter((entry) => entry.date && entry.artist)
    .sort((a, b) => compareDate(a.date, b.date));

  const answerMap = new Map();
  for (const answer of existing.answers ?? []) {
    answerMap.set(answer.date, { ...answer });
  }

  parsedEntries.forEach((entry, index) => {
    const dayNumber = spotleNumber - (parsedEntries.length - 1 - index);
    const current = answerMap.get(entry.date) ?? {};
    answerMap.set(entry.date, {
      ...current,
      date: entry.date,
      dayNumber,
      artist: entry.artist,
      track: entry.track || current.track || '',
      image: entry.image || current.image || '',
      soundcloudUrl: entry.soundcloudUrl || current.soundcloudUrl || ''
    });
  });

  const answers = Array.from(answerMap.values()).sort((a, b) => compareDate(a.date, b.date));
  const artists = Array.from(artistMap.values()).sort((a, b) => a.index - b.index);
  const output = {
    artists,
    answers,
    metadata: {
      startDate: existing.metadata?.startDate ?? answers[0]?.date ?? '',
      totalArtists: artists.length,
      totalAnswers: answers.length,
      lastSyncedAt: new Date().toISOString(),
      source: sourceUrl
    }
  };

  await writeFile(dataPath, `${JSON.stringify(output, null, 2)}\n`);

  const latestSourceDate = parsedEntries[parsedEntries.length - 1]?.date ?? 'unknown';

  await markUpdateSuccess(projectRoot, 'spotle', {
    latestDate: latestSourceDate,
    totalAnswers: answers.length
  });

  console.log(
    `Spotle dataset ready with ${answers.length} answers and ${artists.length} artists. Source merged through ${latestSourceDate} (today=${todaysDate || 'n/a'}, previous=${previousDay || 'n/a'}).`
  );
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Unable to prepare Spotle dataset:', error);
  await markUpdateFailure(
    projectRoot,
    'spotle',
    message,
    {
      source: sourceUrl
    }
  );
  process.exit(1);
});
