const BASE_URL = "https://underworldnewsnetwork.org";

interface ArticleJsonLdProps {
  headline: string;
  description?: string;
  slug: string;
  authorName: string;
  sectionName: string;
  publishedAt: string | null;
  updatedAt: string | null;
  imageUrl?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  slug,
  authorName,
  sectionName,
  publishedAt,
  updatedAt,
  imageUrl,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description: description ?? headline,
    url: `${BASE_URL}/article/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/article/${slug}`,
    },
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Underworld News Network",
      url: BASE_URL,
    },
    articleSection: sectionName,
    ...(publishedAt && { datePublished: publishedAt }),
    ...(updatedAt && { dateModified: updatedAt }),
    ...(imageUrl && {
      image: {
        "@type": "ImageObject",
        url: imageUrl,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
