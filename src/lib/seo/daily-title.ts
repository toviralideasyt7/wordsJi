export function dailyAnswerTitle(gameName: string, puzzleNum: string | number, dateLong: string): string {
	return `Today's ${gameName} Answer & Hints for ${dateLong} (#${puzzleNum}) (Updated Daily)`;
}

export function updatedStampText(gameName: string, puzzleNum: string | number, dateLong: string, now: Date = new Date()): string {
	// Format: "October 6, 2026 at 2:15 PM" — UTC stated explicitly.
	const stampDate =
		new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: 'UTC',
		}).format(now) + ' UTC';
	return `Page last updated ${stampDate}. Current puzzle: ${gameName} #${puzzleNum} for ${dateLong}.`;
}
