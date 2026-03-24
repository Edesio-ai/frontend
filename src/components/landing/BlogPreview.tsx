import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import Link from "next/link";

import { blogArticles } from "@/data/blog-articles";

const articleImages: Record<string, string> = {
    "ia-education-france": "/education-ia.png",
    "mistral-ai-souverainete": "/mistral-tech.jpg",
    "gamification-apprentissage": "/gamification.jpg",
};

const categoryColorsLight: Record<string, string> = {
    "Éducation": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
    "Technologie": "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    "Pédagogie": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    "Sécurité": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    "Témoignages": "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

export function BlogPreview() {
    const latestArticles = blogArticles.slice(0, 3);

    return (
        <section
            id="blog"
            className="py-20 md:py-28 bg-gradient-to-b from-muted/30 to-background"
            data-testid="section-blog-preview"
        >
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Newspaper className="h-4 w-4" />
                        <span>Notre blog</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Les derniers articles
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Découvrez nos analyses, conseils et actualités sur l'IA dans l'éducation
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {latestArticles.map((article, index) => (
                        <Link
                            key={article.id}
                            href={`/blog/${article.slug}`}
                            className="block group"
                        >
                            <Card
                                className="h-full overflow-hidden hover-elevate transition-all duration-300 border-border/50"
                                data-testid={`card-article-preview-${index}`}
                            >
                                <div className="relative h-44 overflow-hidden">
                                    {articleImages[article.id] ? (
                                        <img
                                            src={articleImages[article.id]}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <div className="absolute top-3 left-3">
                                        <Badge
                                            variant="secondary"
                                            className={categoryColorsLight[article.category] || "bg-gray-100 text-gray-700"}
                                        >
                                            {article.category}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{article.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{article.readTime}</span>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {article.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {article.excerpt}
                                    </p>

                                    <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                                        <span>Lire l'article</span>
                                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/blog">
                        <Button
                            size="lg"
                            variant="outline"
                            className="gap-2"
                            data-testid="button-view-all-articles"
                        >
                            Voir tous les articles
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
