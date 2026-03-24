import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/Footer";
import { Functioning } from "@/components/landing/Functioning";
import { ForWho } from "@/components/landing/ForWho";
import { Benefits } from "@/components/landing/Benefits";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { BlogPreview } from "@/components/landing/BlogPreview";
import { DemoForm } from "@/components/landing/DemoForm";

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
        <DemoForm />
      </main>
      <Footer />
    </div>
  );
}
