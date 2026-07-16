'use client';
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, ExternalLink, BookOpen, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "@/app/blog/_components/seo-helmet";
import { getArticleBySlug, categoryColors, getBlogArticles, type ArticleSection } from "@/data/blog-articles";
import { useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "@/lib/i18n/client";

function ArticleContent({ section, index }: { section: ArticleSection; index: number }) {
  switch (section.type) {
    case 'paragraph':
      return (
        <p className="text-slate-300 leading-relaxed mb-6" data-testid={`text-paragraph-${index}`}>
          {section.content}
        </p>
      );
    case 'heading2':
      return (
        <h2 className="text-2xl font-bold text-white mt-10 mb-4" data-testid={`heading-h2-${index}`}>
          {section.content}
        </h2>
      );
    case 'heading3':
      return (
        <h3 className="text-xl font-semibold text-white mt-8 mb-3" data-testid={`heading-h3-${index}`}>
          {section.content}
        </h3>
      );
    case 'list':
      return (
        <div className="mb-6" data-testid={`list-${index}`}>
          <p className="text-slate-300 font-medium mb-3">{section.content}</p>
          <ul className="space-y-2 pl-4">
            {section.items?.map((item, i) => (
              <li key={i} className="text-slate-400 flex items-start gap-2">
                <span className="text-primary mt-1.5 text-xs">●</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 bg-slate-800/50 rounded-r-lg" data-testid={`quote-${index}`}>
          <p className="text-lg text-slate-200 italic mb-2">"{section.content}"</p>
          {section.source && (
            <cite className="text-sm text-slate-400 not-italic">— {section.source}</cite>
          )}
        </blockquote>
      );
    case 'stat':
      return (
        <div className="my-8 p-6 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl border border-primary/30" data-testid={`stat-${index}`}>
          <p className="text-3xl md:text-4xl font-bold text-white mb-2">{section.content}</p>
          {section.source && (
            <p className="text-sm text-slate-400">Source: {section.source}</p>
          )}
        </div>
      );
    case 'callout':
      return (
        <div className={`my-8 p-6 rounded-xl border ${section.highlight ? 'bg-primary/10 border-primary/40' : 'bg-slate-800/50 border-slate-700'}`} data-testid={`callout-${index}`}>
          <p className="text-slate-200 font-medium">{section.content}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const t = useTranslations();
  const locale = useLocale();
  const article = getArticleBySlug(params.slug || '', locale);
  const blogArticles = useMemo(() => getBlogArticles(locale), [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  const parseDate = (dateStr: string): string => {
    const months: Record<string, string> = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12',
    };
    // French: "5 janvier 2026" | English: "January 5, 2026"
    const enMatch = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (enMatch) {
      const [, monthName, day, year] = enMatch;
      const month = months[monthName.toLowerCase()] || '01';
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1].toLowerCase()] || '01';
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 bg-slate-800/50 border-slate-700 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t.blog.articleNotFound}</h1>
          <p className="text-slate-400 mb-6">{t.blog.articleNotFoundDesc}</p>
          <Link href="/blog">
            <Button data-testid="button-back-blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.blog.backToBlog}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const relatedArticles = blogArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 2);

  const otherArticles = relatedArticles.length < 2
    ? blogArticles.filter(a => a.id !== article.id && !relatedArticles.includes(a)).slice(0, 2 - relatedArticles.length)
    : [];

  const suggestedArticles = [...relatedArticles, ...otherArticles];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <Helmet
        title={article.metaTitle}
        description={article.metaDescription}
        keywords={article.keywords}
        ogType="article"
        canonicalUrl={`https://edesio.ai/blog/${article.slug}`}
        articleData={{
          author: article.author,
          datePublished: parseDate(article.date),
          section: article.category,
        }}
      />
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3" data-testid="link-article-home">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-500 p-0.5">
                <img src='/edesio-logo-square.png' alt="Edesio" className="w-full h-full rounded-[10px] object-cover bg-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
              </span>
            </a>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/blog">
              <Button variant="ghost" className="text-slate-300 hover:text-white" data-testid="button-back-blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.blog.badge}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className={categoryColors[article.category]}>
              {article.category}
            </Badge>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              {article.date}
            </div>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              {article.readTime} read
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6" data-testid="text-article-title">
            {article.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{article.author}</p>
              <p className="text-sm text-slate-400">{t.blog.author}</p>
            </div>
          </div>
        </header>

        <Separator className="bg-slate-700 mb-10" />

        <div className="prose prose-invert prose-lg max-w-none">
          {article.content.map((section, index) => (
            <ArticleContent key={index} section={section} index={index} />
          ))}
        </div>

        <Separator className="bg-slate-700 my-10" />

        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t.blog.sources}
          </h2>
          <div className="space-y-4">
            {article.sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-primary/50 transition-colors group"
                data-testid={`link-source-${index}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                      {source.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{source.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <Card className="p-6 md:p-8 bg-slate-800 border-slate-700 mb-12">
          <h3 className="text-xl font-bold text-white mb-3">
            {t.blog.ctaTitle}
          </h3>
          <p className="text-slate-400 mb-4">
            {t.blog.ctaDesc}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/#demo">
              <Button className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90" data-testid="button-article-demo">
                {t.common.demo}
              </Button>
            </Link>
            <Link href="/#tarifs">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800" data-testid="button-article-pricing">
                {t.blog.viewPricing}
              </Button>
            </Link>
          </div>
        </Card>

        {suggestedArticles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">{t.blog.suggestedArticles}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {suggestedArticles.map((relatedArticle) => (
                <Link key={relatedArticle.id} href={`/blog/${relatedArticle.slug}`}>
                  <Card className="overflow-hidden bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-colors group cursor-pointer h-full" data-testid={`card-related-${relatedArticle.id}`}>
                    <div className="p-5">
                      <Badge variant="outline" className={`mb-3 ${categoryColors[relatedArticle.category]}`}>
                        {relatedArticle.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Edesio – {t.blog.allRights}
        </div>
      </footer>
    </div>
  );
}
