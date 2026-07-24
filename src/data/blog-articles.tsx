import type { Locale } from "@/lib/i18n/config";
import type { BlogArticle } from "./blog-types";
import { blogArticlesFr } from "./blog-articles.fr";
import { blogArticlesEn } from "./blog-articles.en";

export type { BlogArticle, ArticleSection, ArticleSource } from "./blog-types";

/** @deprecated Prefer getBlogArticles(locale) — defaults to French for backward compatibility */
export const blogArticles = blogArticlesFr;

export const categoryColors: Record<string, string> = {
  // French categories
  Éducation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Technologie: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Pédagogie: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Sécurité: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Témoignages: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  // English categories
  Education: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Technology: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Pedagogy: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Security: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Testimonials: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function getBlogArticles(locale: Locale = "en"): BlogArticle[] {
  return locale === "fr" ? blogArticlesFr : blogArticlesEn;
}

export function getArticleBySlug(slug: string, locale: Locale = "en"): BlogArticle | undefined {
  return getBlogArticles(locale).find((article) => article.slug === slug);
}

export function getArticleById(id: string, locale: Locale = "en"): BlogArticle | undefined {
  return getBlogArticles(locale).find((article) => article.id === id);
}
