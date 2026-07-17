import type { SkillTag, WeightMap } from '@/engine';

/**
 * Learn-section content model (doc 06). Techniques carry the drill mapping that
 * powers "Drill this" buttons; content ships essentially verbatim from doc 06.
 */

export interface DrillSpec {
  weights: WeightMap;
  tier?: 1 | 2 | 3;
  input?: 'flow' | 'test';
  feedback?: boolean;
  /** Notes a constraint the current generators only approximate. */
  note?: string;
}

export interface Technique {
  id: string; // 'T5'
  slug: string; // 't5-cross-multiplication'
  title: string;
  category: LearnCategory;
  hook: string;
  method: string;
  examples: string[];
  whenToUse?: string;
  pitfall?: string;
  drill?: DrillSpec;
  related?: string[]; // technique ids
  /** Primary skill tag for the mastery chip. */
  masteryTag?: SkillTag;
}

export interface ReferencePage {
  id: string; // 'R1'
  slug: string;
  title: string;
  intro: string;
  columns: string[];
  rows: string[][];
  deck?: string; // "Turn into flashcards" deck id (M5)
}

export interface StrategyArticle {
  id: string; // 'S1'
  slug: string;
  title: string;
  body: string;
}

export type LearnCategory =
  | 'Foundations'
  | 'Multiplication'
  | 'Division & divisibility'
  | 'Fractions, decimals, percentages'
  | 'Test-specific weapons';

export const LEARN_CATEGORIES: LearnCategory[] = [
  'Foundations',
  'Multiplication',
  'Division & divisibility',
  'Fractions, decimals, percentages',
  'Test-specific weapons',
];
