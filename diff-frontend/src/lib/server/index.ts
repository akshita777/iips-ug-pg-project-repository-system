import data from '$lib/data/faculty.json';
import rules from '$lib/data/score-rules.json';
import { IndexPolicy, type IndexRules } from '$lib/domain/scoring/IndexPolicy';
import type { PortalData } from '$lib/domain/types';
import { Portal } from './Portal';

const indexRules = rules as IndexRules;

/** The one data source of the site, read at build time only. */
export const portal = new Portal(data as PortalData, new IndexPolicy(indexRules), indexRules);
