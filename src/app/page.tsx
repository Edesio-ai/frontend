import { Navbar } from "@/app/_components/landing/navbar/navbar";
import { Hero } from "@/app/_components/landing/hero/Hero";
import { Footer } from "@/components/landing/Footer";
import { ForWho } from "@/app/_components/landing/for-who";
import { Benefits } from "@/components/landing/Benefits";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { BlogPreview } from "@/components/landing/BlogPreview";
import { DemoForm } from "@/components/landing/DemoForm";
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
        <DemoForm />
      </main>
      <Footer />
    </div>
  );
}
