/**
 * Parser para guiones de diálogos en formato Markdown.
 *
 * Formato:
 * ---
 * title: Título del diálogo
 * context: Contexto
 * unit: 1
 * speakerRoles:
 *   A: female1
 *   B: female2
 * ---
 *
 * A: English text
 * A: Spanish text
 *
 * B: English text
 * B: Spanish text
 */

import type { Dialogue, DialogueLine } from "@/data/course";
import type { VoiceRole } from "./settings";

interface ParsedFrontmatter {
  title?: string;
  context?: string;
  unit?: number;
  speakerRoles?: Record<string, VoiceRole>;
}

const VALID_ROLES: VoiceRole[] = ["female1", "female2", "male1", "male2"];

function parseFrontmatter(content: string): { frontmatter: ParsedFrontmatter; body: string } {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    return { frontmatter: {}, body: content };
  }
  const fmText = fmMatch[1];
  const body = fmMatch[2];
  const frontmatter: ParsedFrontmatter = {};
  const lines = fmText.split("\n");
  let inSpeakerRoles = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (line.startsWith("  ") && inSpeakerRoles) {
      const subMatch = trimmed.match(/^(\w+):\s*(.+)$/);
      if (subMatch) {
        const [, key, value] = subMatch;
        const role = value.trim() as VoiceRole;
        if (VALID_ROLES.includes(role)) {
          frontmatter.speakerRoles = frontmatter.speakerRoles ?? {};
          (frontmatter.speakerRoles as Record<string, VoiceRole>)[key] = role;
        }
      }
      continue;
    }

    inSpeakerRoles = false;
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    const cleanValue = value.trim().replace(/^["']|["']$/g, "");

    if (key === "title") frontmatter.title = cleanValue;
    else if (key === "context") frontmatter.context = cleanValue;
    else if (key === "unit") frontmatter.unit = parseInt(cleanValue, 10);
    else if (key === "speakerRoles") {
      inSpeakerRoles = true;
      frontmatter.speakerRoles = {};
    }
  }
  return { frontmatter, body };
}

function parseBody(body: string): DialogueLine[] {
  const lines: DialogueLine[] = [];
  const blocks = body.split(/\n\s*\n/);

  for (const block of blocks) {
    const blockLines = block.trim().split("\n").filter((l) => l.trim());
    if (blockLines.length === 0) continue;

    let currentSpeaker: "A" | "B" | "C" | "D" | null = null;
    let englishText = "";
    let spanishText = "";

    for (const line of blockLines) {
      const match = line.match(/^([A-D]):\s*(.+)$/);
      if (!match) continue;
      const [, speaker, text] = match;
      const speakerLetter = speaker as "A" | "B" | "C" | "D";

      if (currentSpeaker === null) {
        currentSpeaker = speakerLetter;
        englishText = text;
      } else if (speakerLetter === currentSpeaker) {
        spanishText = text;
      } else {
        if (currentSpeaker && englishText) {
          lines.push({
            speaker: currentSpeaker,
            en: englishText,
            es: spanishText || englishText,
          });
        }
        currentSpeaker = speakerLetter;
        englishText = text;
        spanishText = "";
      }
    }

    if (currentSpeaker && englishText) {
      lines.push({
        speaker: currentSpeaker,
        en: englishText,
        es: spanishText || englishText,
      });
    }
  }
  return lines;
}

export function parseDialogueMarkdown(content: string, fallbackTitle?: string): Dialogue | null {
  const { frontmatter, body } = parseFrontmatter(content);
  const lines = parseBody(body);
  if (lines.length === 0) return null;

  return {
    title: frontmatter.title ?? fallbackTitle ?? "Diálogo",
    context: frontmatter.context ?? "",
    speakerRoles: frontmatter.speakerRoles,
    lines,
  };
}

export interface DialogueFile {
  filename: string;
  unitId: number;
}

export const AVAILABLE_DIALOGUES: DialogueFile[] = [
  { filename: "unit1-cafe", unitId: 1 },
  { filename: "unit1-hotel", unitId: 1 },
  { filename: "unit2-parque", unitId: 2 },
  { filename: "unit2-padres", unitId: 2 },
];

export async function loadDialogueFromFile(filename: string): Promise<Dialogue | null> {
  try {
    const res = await fetch(`/content/dialogues/${filename}.md`);
    if (!res.ok) return null;
    const text = await res.text();
    return parseDialogueMarkdown(text, filename);
  } catch {
    return null;
  }
}

export async function loadDialoguesForUnit(unitId: number): Promise<Dialogue[] | null> {
  const files = AVAILABLE_DIALOGUES.filter((d) => d.unitId === unitId);
  if (files.length === 0) return null;
  const results = await Promise.all(
    files.map((f) => loadDialogueFromFile(f.filename))
  );
  const valid = results.filter((d): d is Dialogue => d !== null);
  return valid.length > 0 ? valid : null;
}
