"use client";

import { Minus, Plus } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FaqItemProps = {
  index: number;
  question: string;
  answer: string;
};

export function FaqItem({ index, question, answer }: FaqItemProps) {
  return (
    <AccordionItem
      value={`faq-${index}`}
      className="border-b border-border border-t-0"
      data-testid={`accordion-item-${index + 1}`}
    >
      <AccordionTrigger className="group gap-4 py-5 text-left text-[15px] font-semibold hover:no-underline [&>svg:last-child]:hidden">
        <span className="flex-1">{question}</span>
        <Plus className="size-4 shrink-0 text-foreground group-data-[state=open]:hidden" aria-hidden="true" />
        <Minus className="hidden size-4 shrink-0 text-foreground group-data-[state=open]:block" aria-hidden="true" />
      </AccordionTrigger>
      <AccordionContent className="pb-5 text-sm leading-relaxed text-tertiary-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
}
