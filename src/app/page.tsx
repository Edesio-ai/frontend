import { Navbar } from "@/app/_components/landing/navbar/navbar";
import { Hero } from "@/app/_components/landing/hero/Hero";
import { Footer } from "@/app/_components/landing/footer/footer";
import { ForWho } from "@/app/_components/landing/for-who/for-who";
import { Benefits } from "@/app/_components/landing/benefits/benefits";
import { Pricing } from "@/app/_components/landing/pricing/pricing";
import { FAQ } from "@/app/_components/landing/faq/faq";
import { BlogPreview } from "@/app/_components/landing/blog-preview/blog-preview";
import { FinalCta } from "@/app/_components/landing/final-cta/final-cta";
import { Functioning } from "./_components/landing/functioning/Functioning";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" data-testid="page-home">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Functioning />
        <ForWho />
        <Benefits />
        <Pricing />
        <FAQ />
        <BlogPreview />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
