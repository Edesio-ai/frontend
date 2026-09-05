import Link from "next/link";
import type { BlogArticle } from "@/data/blog-types";
import { getBlogArticleImage } from "@/data/blog-article-images";
import { cn } from "@/lib/utils";

type BlogPreviewArticleCardProps = {
  article: BlogArticle;
  index: number;
  readArticleLabel: string;
};

export function BlogPreviewArticleCard({ article, index, readArticleLabel }: BlogPreviewArticleCardProps) {
  const imageSrc = getBlogArticleImage(article.id);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block h-full no-underline"
      data-testid={`card-article-preview-${index}`}
    >
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-background text-foreground",
          "transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-zinc-300 hover:shadow-[0_16px_32px_-14px_rgba(24,24,27,0.18)]",
        )}
      >
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={article.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
          )}
        </div>

        <div className="flex flex-1 flex-col p-[22px]">
          <span className="mb-3.5 inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground/80">
            {article.category}
          </span>

          <p className="mb-2.5 text-xs text-landing-subtle">
            {article.date} · {article.readTime}
          </p>

          <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-foreground">{article.title}</h3>

          <p className="mb-3.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-tertiary-foreground">
            {article.excerpt}
          </p>

          <span className="text-[13px] font-semibold text-primary">{readArticleLabel} →</span>
        </div>
      </article>
    </Link>
  );
}
