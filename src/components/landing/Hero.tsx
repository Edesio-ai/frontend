
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import mistralLogo from "@assets/Untitled_design__33_-removebg-preview_1765063959020.png";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ChatSimulation } from "./ChatSimulation";

export function Hero() {
    return (
        <section
            className="relative py-16 md:py-28 lg:py-36 px-4 sm:px-6 md:px-8 overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90"
            data-testid="section-hero"
        >
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Decorative gradient orbs */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-10 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="space-y-8">
                        <Badge
                            variant="secondary"
                            className="gap-2 px-4 py-2 text-sm font-medium bg-white/10 text-white border-white/20 backdrop-blur-sm"
                            data-testid="badge-hero"
                        >
                            <GraduationCap className="h-4 w-4" />
                            Collèges, lycées et études supérieures
                        </Badge>

                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white"
                            data-testid="text-hero-title"
                        >
                            <span className="bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Edesio</span> : le chatbot qui entraîne et évalue
                        </h1>

                        <p
                            className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed"
                            data-testid="text-hero-subtitle"
                        >
                            Les professeurs déposent leurs cours, <span className="font-semibold text-white">Edesio</span> génère des
                            questions, discute avec les élèves et vous fournit des retours
                            clairs sur leurs progrès.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Button size="lg" className="gap-2 bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10" asChild>
                                <Link href="/inscription" data-testid="button-hero-signup">
                                    <Sparkles className="h-4 w-4" />
                                    Créer un compte gratuitement
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                                asChild
                            >
                                <Link href="/connexion" data-testid="button-hero-connexion">
                                    Connexion
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                            <a
                                href="https://mistral.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors"
                                data-testid="badge-mistral"
                            >
                                <span className="text-[10px] text-slate-400">Propulsé par</span>
                                <img src='/teenage-girl-student.png' alt="Mistral AI" className="h-8 w-auto" />
                                <Badge variant="secondary" className="ml-1 bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px] px-1.5 py-0.5">
                                    IA Française
                                </Badge>
                            </a>
                            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 border-2 border-slate-800 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-sm" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-slate-800 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-full" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 border-2 border-slate-800 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-white rotate-45" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-slate-800 flex items-center justify-center">
                                        <div className="w-3 h-1.5 bg-white rounded-full" />
                                    </div>
                                </div>
                                <span className="text-sm text-slate-400">+20 établissements</span>
                            </div>
                            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                            <div className="text-sm text-slate-400">
                                <span className="text-sky-400 font-semibold">RGPD</span> conforme
                            </div>
                        </div>
                    </div>

                    <div className="order-last">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 to-purple-500/20 rounded-3xl blur-2xl" />
                            <div className="relative">
                                <ChatSimulation />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}