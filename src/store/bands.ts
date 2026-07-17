import {
  SPRINT_BANDS,
  OPTIVER_BANDS,
  FLOW_BANDS,
  type Band,
} from '@/content/bands';
import { buildPlanFromPreset, ZETAMAC_DEFAULT } from './presets';
import type { Session } from './types';

/** The configHash of the exact Zetamac Default (bands apply only to it). */
export const ZETAMAC_DEFAULT_CONFIG_HASH = buildPlanFromPreset(
  ZETAMAC_DEFAULT,
  0,
).configHash;

/**
 * The band set for a session, or null when bands don't apply (custom/extended
 * sprints and unbenchmarked modes — doc 05 §3).
 */
export function bandsForSession(session: Session): Band[] | null {
  if (session.mode === 'sim') {
    if (session.simId === 'optiver80' || session.simId === 'akuna80') {
      return OPTIVER_BANDS;
    }
    if (session.simId === 'flow60') return FLOW_BANDS;
    return null;
  }
  if (
    session.mode === 'sprint' &&
    !session.extended &&
    session.configHash === ZETAMAC_DEFAULT_CONFIG_HASH
  ) {
    return SPRINT_BANDS;
  }
  return null;
}
