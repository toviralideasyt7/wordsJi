/**
 * Verify deployment by crawling key pages and checking for expected content.
 */
const BASE_URL = 'https://c141cbc5.wordsolverx-z-ai.pages.dev';

const checks = [
  {
    name: 'Colorfle Answer Today',
    path: '/colorfle-answer-today',
    mustContain: ['Click to Reveal', 'Color Breakdown', 'Target Color'],
    mustNotContain: [],
  },
  {
    name: 'Colorfle Archive',
    path: '/colorfle-archive',
    mustContain: ['Colorfle Archive', 'Target Color', 'RGB('],
    mustNotContain: [],
  },
  {
    name: 'Nerdle Answer Today',
    path: '/nerdle-answer-today',
    mustContain: ['Nerdle Answer Today', 'green on black', '#0f172a', '#000000'],
    mustNotContain: ['dark slate'],
  },
  {
    name: 'Framed Answer Today',
    path: '/framed-answer-today',
    mustContain: ['Framed Answer Today', 'Browse Archive'],
    mustNotContain: ['not stored yet'], // Should have data or show proper fallback
  },
  {
    name: 'Narutodle Answer Today',
    path: '/narutodle-answer-today-updated',
    mustContain: ['What is Narutodle?', 'p-5'],
    mustNotContain: [],
  },
  {
    name: 'Dotadle Answer Today',
    path: '/dotadle-answer-today-updated',
    mustContain: ['What is Dotadle?', 'p-5'],
    mustNotContain: [],
  },
];

async function verify() {
  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const url = `${BASE_URL}${check.path}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      
      let ok = true;
      const issues = [];

      for (const text of check.mustContain) {
        if (!html.includes(text)) {
          ok = false;
          issues.push(`MISSING: "${text}"`);
        }
      }

      for (const text of check.mustNotContain) {
        if (html.includes(text)) {
          ok = false;
          issues.push(`UNEXPECTED: "${text}"`);
        }
      }

      if (ok) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED`);
        issues.forEach(i => console.log(`   - ${i}`));
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${check.name}: ERROR - ${err.message}`);
      failed++;
    }
  }


