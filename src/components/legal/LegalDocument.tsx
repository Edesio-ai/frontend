import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LegalPageContent } from "@/data/legal/types";
import { RichText } from "./RichText";

export function LegalDocument({ content }: { content: LegalPageContent }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {content.backHome}
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8" data-testid="text-title">
          {content.title}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              {section.blocks.map((block, i) => {
                if (block.type === "p") {
                  return (
                    <p key={i} className={`text-muted-foreground leading-relaxed${i > 0 ? " mt-4" : ""}`}>
                      <RichText text={block.text} />
                    </p>
                  );
                }
                if (block.type === "h3") {
                  return (
                    <h3 key={i} className="text-lg font-medium mb-3 mt-6">
                      {block.text}
                    </h3>
                  );
                }
                const listClass =
                  block.style === "none"
                    ? "list-none space-y-2 text-muted-foreground mt-4"
                    : "list-disc list-inside space-y-2 text-muted-foreground mt-4";
                return (
                  <ul key={i} className={listClass}>
                    {block.items.map((item, j) => (
                      <li key={j}>
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                );
              })}
            </section>
          ))}

          <p className="text-sm text-muted-foreground mt-12">{content.lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}
