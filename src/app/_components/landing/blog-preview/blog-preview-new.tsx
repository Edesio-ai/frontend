"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { getBlogArticles } from "@/data/blog-articles";
import { BlogPreviewArticleCard } from "./blog-preview-article-card";

export function BlogPreviewNew() {
  const t = useTranslations().landing.blogPreview.new;
  const locale = useLocale();
  const latestArticles = getBlogArticles(locale).slice(0, 3);

  return (
    <section
      id="blog"
      className="mx-auto max-w-[1160px] border-t border-landing-nav-divider bg-background px-6 py-20"
      data-testid="section-blog-preview"
    >
      <header className="mb-11 max-w-[520px]">
        <p className="mb-2 text-[13px] font-semibold text-primary">{t.eyebrow}</p>
        <h2 className="mb-2.5 text-[32px] font-extrabold tracking-[-0.02em] text-foreground">{t.title}</h2>
        <p className="text-sm text-tertiary-foreground">{t.subtitle}</p>
      </header>

      <div className="mb-9 grid grid-cols-1 gap-6 md:grid-cols-3">
        {latestArticles.map((article, index) => (
          <BlogPreviewArticleCard key={article.id} article={article} index={index} readArticleLabel={t.readArticle} />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/blog"
          className="text-sm font-semibold text-foreground no-underline transition-opacity hover:opacity-70"
          data-testid="button-view-all-articles"
        >
          {t.viewAll} →
        </Link>
      </div>
    </section>
  );
}
