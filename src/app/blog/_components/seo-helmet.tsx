import { useEffect } from "react";
import { getOgImageUrl, getSiteUrl } from "@/lib/metadata/site-url";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
  articleData?: {
    author: string;
    datePublished: string;
    dateModified?: string;
    section: string;
  };
}

export function Helmet({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  ogType = "website",
  ogImage,
  canonicalUrl,
  articleData,
}: SEOProps) {
  useEffect(() => {
    document.title = title;
    const defaultOgImage = getOgImageUrl();
    const resolvedOgImage = ogImage ?? defaultOgImage;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    updateMeta("description", description);
    if (keywords.length > 0) {
      updateMeta("keywords", keywords.join(", "));
    }

    updateMeta("og:title", ogTitle || title, true);
    updateMeta("og:description", ogDescription || description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", resolvedOgImage, true);
    updateMeta("og:locale", "fr_FR", true);
    updateMeta("og:site_name", "Edesio", true);

    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", ogTitle || title);
    updateMeta("twitter:description", ogDescription || description);
    updateMeta("twitter:image", resolvedOgImage);

    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", canonicalUrl);
      } else {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        canonical.setAttribute("href", canonicalUrl);
        document.head.appendChild(canonical);
      }
    }

    if (articleData) {
      const existingArticleScript = document.getElementById("article-schema");
      if (existingArticleScript) {
        existingArticleScript.remove();
      }

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description,
        image: resolvedOgImage,
        author: {
          "@type": "Organization",
          name: articleData.author,
        },
        publisher: {
          "@type": "Organization",
          name: "Edesio",
          logo: {
            "@type": "ImageObject",
            url: resolvedOgImage,
          },
        },
        datePublished: articleData.datePublished,
        dateModified: articleData.dateModified || articleData.datePublished,
        articleSection: articleData.section,
        inLanguage: "fr-FR",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl || window.location.href,
        },
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "article-schema";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const existingArticleScript = document.getElementById("article-schema");
      if (existingArticleScript) {
        existingArticleScript.remove();
      }
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogType, ogImage, canonicalUrl, articleData]);

  return null;
}

export function OrganizationSchema() {
  useEffect(() => {
    const siteUrl = getSiteUrl().toString().replace(/\/$/, "");
    const logoUrl = getOgImageUrl();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Edesio",
      alternateName: "Edesio",
      url: siteUrl,
      logo: logoUrl,
      description:
        "Plateforme éducative IA pour établissements scolaires français. Les professeurs déposent leurs cours, l'IA génère des questions et entraîne les élèves.",
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "",
        contactType: "customer service",
        email: "contact@edesio.ai",
        availableLanguage: ["French"],
      },
      areaServed: {
        "@type": "Country",
        name: "France",
      },
      knowsAbout: [
        "Intelligence artificielle éducative",
        "EdTech",
        "QCM automatisés",
        "Apprentissage personnalisé",
        "Gamification éducative",
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "organization-schema";
    script.textContent = JSON.stringify(jsonLd);

    const existing = document.getElementById("organization-schema");
    if (existing) {
      existing.remove();
    }
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("organization-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-schema";
    script.textContent = JSON.stringify(jsonLd);

    const existing = document.getElementById("breadcrumb-schema");
    if (existing) {
      existing.remove();
    }
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("breadcrumb-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return null;
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.textContent = JSON.stringify(jsonLd);

    const existing = document.getElementById("faq-schema");
    if (existing) {
      existing.remove();
    }
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("faq-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [faqs]);

  return null;
}

export function SoftwareApplicationSchema() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Edesio",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "499",
        priceCurrency: "EUR",
        offerCount: "4",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
      },
      description:
        "Plateforme éducative IA pour établissements scolaires. Génération automatique de questions à partir des cours, interface gamifiée type Kahoot/Duolingo.",
      featureList: [
        "Génération automatique de QCM",
        "Questions ouvertes avec correction IA",
        "Interface gamifiée style Kahoot",
        "Suivi de progression des élèves",
        "Classements par cours",
        "Support multilingue",
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "software-schema";
    script.textContent = JSON.stringify(jsonLd);

    const existing = document.getElementById("software-schema");
    if (existing) {
      existing.remove();
    }
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("software-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}
