const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
  '9': 'g', '@': 'a', '$': 's', '!': 'i',
};

const BANNED_WORDS: string[] = [
  'suka', 'blya', 'blyat', 'pidar', 'pidaraz',
  'huy', 'hui', 'xuy', 'xui',
  'bitch', 'fuck', 'fucking', 'fucker', 'shit', 'asshole',
];

function mapChar(ch: string): string {
  const lower = ch.toLowerCase();
  if (CYRILLIC[lower] !== undefined) return CYRILLIC[lower];
  return LEET[ch] ?? lower;
}

function lettersOnly(text: string): string {
  let out = '';
  for (const ch of text) {
    const mapped = mapChar(ch);
    for (const c of mapped) {
      if (c >= 'a' && c <= 'z') out += c;
    }
  }
  return out.replace(/([a-z])\1+/g, '$1');
}

function isMaskedSubsequence(core: string, word: string): boolean {
  if (core.length < 2) return false;
  if (core[0] !== word[0] || core[core.length - 1] !== word[word.length - 1]) {
    return false;
  }
  let i = 0;
  for (const ch of word) {
    if (ch === core[i]) i += 1;
    if (i === core.length) return true;
  }
  return false;
}

export function containsProfanity(text: string): boolean {
  const core = lettersOnly(text);
  if (core.length === 0) return false;

  for (const word of BANNED_WORDS) {
    if (core.includes(word)) return true;
  }

  if (/\*/.test(text)) {
    for (const word of BANNED_WORDS) {
      if (isMaskedSubsequence(core, word)) return true;
    }
  }

  return false;
}