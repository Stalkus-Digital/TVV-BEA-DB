export interface FAQ {
  /** Optional id for analytics / anchor linking. */
  id?: string;
  q: string;
  a: string;
  /** Grouping for FAQ pages and contextual rendering (e.g. "andaman", "booking"). */
  category?: string;
  /** Surface this FAQ in specific contexts. */
  tags?: string[];
}
