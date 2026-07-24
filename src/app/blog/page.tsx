"use client";
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet, BreadcrumbSchema } from "@/app/blog/_components/seo-helmet";
import { getBlogArticles, categoryColors } from "@/data/blog-articles";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/i18n/client";

export default function Blog() {
  const t = useTranslations();
  const locale = useLocale();
  const articles = useMemo(() => getBlogArticles(locale), [locale]);
  const featuredPost = articles.find((post) => post.featured);
  const regularPosts = articles.filter((post) => !post.featured);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <Helmet
        title={t.blog.title}
        description={t.blog.description}
        keywords={[t.blog.title, t.blog.description]}
        canonicalUrl="https://edesio.ai/blog"
      />
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "https://edesio.ai" },
          { name: "Blog", url: "https://edesio.ai/blog" },
        ]}
      />
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-500 p-0.5">
              <img
                src="/edesio-logo-square.png"
                alt="Edesio"
                className="w-full h-full rounded-[10px] object-cover bg-white"
              />
            </div>
            <span className="text-xl font-bold text-white">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.blog.backToBlog}
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Blog</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.blog.heading}</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">{t.blog.subtitle}</p>
        </div>

        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`}>
            <Card
              className="mb-12 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-primary/50 transition-colors group cursor-pointer"
              data-testid={`card-blog-${featuredPost.id}`}
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="bg-primary text-white">Featured</Badge>
                  <Badge variant="outline" className={categoryColors[featuredPost.category]}>
                    {featuredPost.category}
                  </Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-400 text-lg mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime} read
                  </div>
                </div>
                <Button
                  className="mt-6 group-hover:bg-primary group-hover:text-white transition-colors"
                  variant="secondary"
                  data-testid={`button-read-${featuredPost.id}`}
                >
                  {t.blog.readMore}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </Link>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card
                className="overflow-hidden bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-colors group cursor-pointer flex flex-col h-full"
                data-testid={`card-blog-${post.id}`}
              >
                <div className="p-5 flex flex-col flex-1">
                  <Badge variant="outline" className={`w-fit mb-3 ${categoryColors[post.category]}`}>
                    {post.category}
                  </Badge>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {/* TODO: Uncomment when newsletter form is ready */}
        {/* <div className="mt-16">
          <Card className="max-w-2xl mx-auto p-8 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Restez informé
                </h3>
                <p className="text-slate-400 text-sm">
                  Recevez nos derniers articles directement par email
                </p>
              </div>
            </div>
            <NewsletterForm source="blog" />
          </Card>
        </div> */}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Edesio – {t.blog.allRights}
        </div>
      </footer>
    </div>
  );
}
