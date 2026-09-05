export const blogArticleImages: Record<string, string> = {
  "ia-education-france": "/education-ia.png",
  "mistral-ai-souverainete": "/mistral-tech.jpg",
  "gamification-apprentissage": "/gamification.jpg",
};

export function getBlogArticleImage(articleId: string): string | undefined {
  return blogArticleImages[articleId];
}
