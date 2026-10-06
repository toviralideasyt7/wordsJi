<script lang="ts">
  interface Props {
    gameName?: string;
    puzzleNumber?: string;
    dateLong?: string;
    firstLetter?: string;
    lastLetter?: string;
    vowelCount?: number;
    repeatText?: string;
    previousUse?: string | null;
  }

  let {
    gameName = 'Wordle',
    puzzleNumber = '',
    dateLong = '',
    firstLetter = '',
    lastLetter = '',
    vowelCount = 0,
    repeatText = '',
    previousUse = null
  }: Props = $props();
</script>

<div class="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-100 dark:border-slate-700 p-6">
  <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-4">Puzzle facts</h2>
  <dl aria-label="Puzzle facts for {gameName}" class="grid grid-cols-2 gap-x-6 gap-y-4">
    <div>
      <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Puzzle number</dt>
      <dd class="font-bold text-slate-900 dark:text-slate-100">{puzzleNumber || '—'}</dd>
    </div>
    <div>
      <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Date</dt>
      <dd class="font-bold text-slate-900 dark:text-slate-100">{dateLong || '—'}</dd>
    </div>
    <div>
      <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">First letter</dt>
      <dd class="font-bold text-slate-900 dark:text-slate-100">{firstLetter ? firstLetter.toUpperCase() : '—'}</dd>
    </div>
    <div>
      <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Last letter</dt>
      <dd class="font-bold text-slate-900 dark:text-slate-100">{lastLetter ? lastLetter.toUpperCase() : '—'}</dd>
    </div>
    <div>
      <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Vowels</dt>
      <dd class="font-bold text-slate-900 dark:text-slate-100">{vowelCount}</dd>
    </div>
    <div>
      <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Repeats</dt>
      <dd class="font-bold text-slate-900 dark:text-slate-100">{repeatText || '—'}</dd>
    </div>
    {#if previousUse}
      <div class="col-span-2">
        <dt class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Previous use</dt>
        <dd class="font-bold text-slate-900 dark:text-slate-100">{previousUse}</dd>
      </div>
    {/if}
  </dl>
</div>
