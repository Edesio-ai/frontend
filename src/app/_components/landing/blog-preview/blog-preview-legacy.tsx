"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import Link from "next/link";
import { getBlogArticles } from "@/data/blog-articles";
import { getBlogArticleImage } from "@/data/blog-article-images";
import { useLocale, useTranslations } from "@/lib/i18n/client";

const categoryColorsLight: Record<string, string> = {
  Éducation: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
  Technologie: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  Pédagogie: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  Sécurité: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  Témoignages: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
  Education: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
  Technology: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  Pedagogy: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  Security: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  Testimonials: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

export function BlogPreviewLegacy() {
  const t = useTranslations().landing.blogPreview.legacy;
  const locale = useLocale();
  const latestArticles = getBlogArticles(locale).slice(0, 3);

  return (
    <section
      id="blog"
      className="bg-gradient-to-b from-muted/30 to-background py-20 md:py-28"
      data-testid="section-blog-preview"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Newspaper className="h-4 w-4" />
            <span>{t.badge}</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t.title}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {latestArticles.map((article, index) => {
            const imageSrc = getBlogArticleImage(article.id);

            return (
              <Link key={article.id} href={`/blog/${article.slug}`} className="group block">
                <Card
                  className="h-full overflow-hidden border-border/50 transition-all duration-300 hover-elevate"
                  data-testid={`card-article-preview-${index}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <Badge
                        variant="secondary"
                        className={categoryColorsLight[article.category] || "bg-gray-100 text-gray-700"}
                      >
                        {article.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>

                    <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>

                    <div className="mt-4 flex items-center text-sm font-medium text-primary transition-all group-hover:gap-2">
                      <span>{t.readArticle}</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/blog">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-view-all-articles">
              {t.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
