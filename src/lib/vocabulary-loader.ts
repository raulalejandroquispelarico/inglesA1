/**
 * Parser y cargador para archivos de vocabulario en formato Markdown.
 *
 * Los archivos viven en /content/vocabulary/*.md y se cargan dinámicamente.
 *
 * Formato:
 * ---
 * unit: 1
 * category: Saludos
 * ---
 *
 * - word: Hello
 *   ipa: /həˈloʊ/
 *   simplified: je-lo
 *   translation: Hola
 *   emoji: 👋
 *
 * ## Otra categoría
 *
 * - word: Bye
 *   ipa: /baɪ/
 *   simplified: bái
 *   translation: Chao
 */

import type { VocabItem } from "@/data/course";

interface ParsedFrontmatter {
  unit?: number;
  category?: string;
}

interface ParsedVocabItem {
  word: string;
  ipa?: string;
  simplified?: string;
  pronunciation?: string;
  translation: string;
  category: string;
  emoji?: string;
}

function parseFrontmatter(content: string): { frontmatter: ParsedFrontmatter; body: string } {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    return { frontmatter: {}, body: content };
  }
  const fmText = fmMatch[1];
  const body = fmMatch[2];
  const frontmatter: ParsedFrontmatter = {};
  const lines = fmText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    const cleanValue = value.trim().replace(/^["']|["']$/g, "");
    if (key === "unit") {
      frontmatter.unit = parseInt(cleanValue, 10);
    } else if (key === "category") {
      frontmatter.category = cleanValue;
    }
  }
  return { frontmatter, body };
}

function parseBody(body: string, defaultCategory: string): ParsedVocabItem[] {
  const items: ParsedVocabItem[] = [];
  const lines = body.split("\n");
  let currentItem: Partial<ParsedVocabItem> | null = null;
  let currentCategory = defaultCategory;

  const flushItem = () => {
    if (currentItem && currentItem.word && currentItem.translation) {
      const ipa = currentItem.ipa ?? "";
      const simplified = currentItem.simplified ?? "";
      const pronunciation = simplified ? `${ipa} (${simplified})` : ipa;
      items.push({
        word: currentItem.word,
        pronunciation,
        translation: currentItem.translation,
        category: currentItem.category ?? currentCategory,
        emoji: currentItem.emoji,
      });
    }
    currentItem = null;
  };

  for (const line of lines) {
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      flushItem();
      currentCategory = categoryMatch[1].trim();
      continue;
    }
    const wordMatch = line.match(/^-\s+word:\s*(.+)$/);
    if (wordMatch) {
      flushItem();
      currentItem = {
        word: wordMatch[1].trim(),
        category: currentCategory,
      };
      continue;
    }
    const propMatch = line.match(/^\s+(\w+):\s*(.*)$/);
    if (propMatch && currentItem) {
      const [, key, value] = propMatch;
      const cleanValue = value.trim().replace(/^["']|["']$/g, "");
      if (key === "ipa") currentItem.ipa = cleanValue;
      else if (key === "simplified") currentItem.simplified = cleanValue;
      else if (key === "translation") currentItem.translation = cleanValue;
      else if (key === "emoji") currentItem.emoji = cleanValue;
      else if (key === "category") currentItem.category = cleanValue;
    }
  }
  flushItem();
  return items;
}

export function parseVocabularyMarkdown(content: string): VocabItem[] {
  const { frontmatter, body } = parseFrontmatter(content);
  const defaultCategory = frontmatter.category ?? "General";
  const parsed = parseBody(body, defaultCategory);
  return parsed.map((item) => ({
    word: item.word,
    pronunciation: item.pronunciation ?? "",
    translation: item.translation,
    category: item.category,
    emoji: item.emoji,
  }));
}

export interface VocabularyFile {
  filename: string;
  unitId: number;
}

export const AVAILABLE_VOCABULARY: VocabularyFile[] = [
  { filename: "unit1-saludos-despedidas", unitId: 1 },
  { filename: "unit1-presentaciones", unitId: 1 },
  { filename: "unit1-alfabeto", unitId: 1 },
  { filename: "unit1-numeros", unitId: 1 },
  { filename: "unit2-familia", unitId: 2 },
  { filename: "unit2-adjetivos", unitId: 2 },
  { filename: "unit2-amigos", unitId: 2 },
];

export async function loadVocabularyFromFile(filename: string): Promise<VocabItem[]> {
  try {
    const res = await fetch(`/content/vocabulary/${filename}.md`);
    if (!res.ok) return [];
    const text = await res.text();
    return parseVocabularyMarkdown(text);
  } catch {
    return [];
  }
}

export async function loadVocabularyForUnit(unitId: number): Promise<VocabItem[] | null> {
  const files = AVAILABLE_VOCABULARY.filter((v) => v.unitId === unitId);
  if (files.length === 0) return null;
  const results = await Promise.all(
    files.map((f) => loadVocabularyFromFile(f.filename))
  );
  const allItems = results.flat();
  return allItems.length > 0 ? allItems : null;
}
