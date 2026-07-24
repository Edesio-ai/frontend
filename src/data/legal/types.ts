export type LegalBlock =
  { type: "p"; text: string } | { type: "h3"; text: string } | { type: "ul"; items: string[]; style?: "disc" | "none" };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalPageContent {
  title: string;
  backHome: string;
  lastUpdated: string;
  sections: LegalSection[];
}
