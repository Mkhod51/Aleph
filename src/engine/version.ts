/**
 * Bump on ANY generator change that alters the question sequence for a given
 * SessionPlan+seed (doc 04 §2, doc 08 §4). Stored on every session so replay and
 * daily-challenge comparison semantics stay honest across engine changes.
 */
export const ENGINE_VERSION = 1;
