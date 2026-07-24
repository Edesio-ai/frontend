export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  keywords: string[];
  content: ArticleSection[];
  sources: ArticleSource[];
}

export interface ArticleSection {
  type: "paragraph" | "heading2" | "heading3" | "list" | "quote" | "stat" | "callout";
  content: string;
  items?: string[];
  source?: string;
  highlight?: boolean;
}

export interface ArticleSource {
  name: string;
  url: string;
  description: string;
}
