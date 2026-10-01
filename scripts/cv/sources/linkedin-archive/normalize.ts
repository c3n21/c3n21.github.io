const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

export function normalizeLinkedInDate(input?: string): string | undefined {
  const value = input?.trim();
  if (!value) return undefined;

  if (/^\d{4}$/.test(value)) return value;

  const match = /^([A-Z][a-z]{2}) (\d{4})$/.exec(value);
  if (!match) {
    throw new Error(`Unsupported LinkedIn date: ${value}`);
  }

  const month = MONTHS[match[1]];
  if (!month) {
    throw new Error(`Unsupported LinkedIn month: ${match[1]}`);
  }

  return `${match[2]}-${month}`;
}

export function splitDescription(input?: string): {
  summary?: string;
  highlights: string[];
} {
  const value = input?.trim();
  if (!value) return { highlights: [] };

  const parts = value
    .split(/\s+[·•]\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    return { summary: parts[0], highlights: [] };
  }

  return {
    summary: parts[0],
    highlights: parts.slice(1),
  };
}
