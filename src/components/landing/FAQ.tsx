import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield, Lock } from "lucide-react";

const faqs = [
    {
        question: "Comment mes données et celles de mes élèves sont-elles protégées ?",
        answer:
            "Edesio respecte strictement le RGPD. Toutes les données sont hébergées en Europe, sur des serveurs sécurisés. Nous n'utilisons jamais les données des élèves à des fins commerciales. Les établissements restent propriétaires de leurs données et peuvent les supprimer à tout moment.",
    },
    {
        question: "Quel est le rôle du professeur avec Edesio ?",
        answer:
            "Le professeur reste au cœur du dispositif. Il dépose ses cours, valide les questions générées par l'IA s'il le souhaite, et consulte les rapports de progression des élèves. Edesio est un outil d'aide qui libère du temps pour l'accompagnement humain, sans jamais remplacer l'enseignant.",
    },
    {
        question: "Comment l'IA génère-t-elle les questions ?",
        answer:
            "Notre IA analyse le contenu de vos cours (PDF, documents) et génère des questions directement liées à votre enseignement. Chaque question est basée sur la matière que vous avez transmise, garantissant ainsi une révision pertinente et alignée avec votre programme.",
    },
    {
        question: "À quels types d'établissements s'adresse Edesio ?",
        answer:
            "Edesio est conçu pour les collèges, lycées généraux, technologiques et professionnels, ainsi que pour l'enseignement supérieur (BTS, classes préparatoires, écoles). La plateforme s'adapte à toutes les matières et niveaux.",
    },
    {
        question: "Comment se passe la mise en place technique ?",
        answer:
            "Edesio est une solution SaaS accessible via un simple navigateur web. Aucune installation n'est nécessaire. Nous accompagnons les établissements dans la prise en main avec des sessions de formation pour les équipes pédagogiques. L'intégration avec votre ENT existant est possible sur demande.",
    },
    {
        question: "Les élèves peuvent-ils tricher avec le chatbot ?",
        answer:
            "Edesio est conçu pour l'entraînement, pas pour l'évaluation sommative. Le chatbot guide les élèves vers les bonnes réponses plutôt que de les donner directement. Les professeurs ont accès aux historiques de conversation et peuvent suivre la progression réelle de chaque élève.",
    },
];

export function FAQ() {
    return (
        <section
            id="faq"
            className="py-20 md:py-28 lg:py-36 px-4 md:px-8 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-violet-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
            data-testid="section-faq"
        >
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg">
                        <HelpCircle className="h-7 w-7 text-white" />
                    </div>
                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                        data-testid="text-faq-title"
                    >
                        Questions{" "}
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">fréquentes</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Tout ce que vous devez savoir sur <span className="font-semibold text-foreground">Edesio</span>.
                    </p>
                </div>

                <Accordion
                    type="single"
                    collapsible
                    className="space-y-4"
                    data-testid="accordion-faq"
                >
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`faq-${index}`}
                            className="border-none rounded-2xl px-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                            data-testid={`accordion-item-${index + 1}`}
                        >
                            <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline py-5">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Trust strip */}
                <div className="mt-12 p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-indigo-200/50 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Conforme RGPD</p>
                                <p className="text-xs text-muted-foreground">Données protégées</p>
                            </div>
                        </div>
                        <div className="hidden md:block h-8 w-px bg-indigo-200 dark:bg-slate-600" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Hébergement sécurisé</p>
                                <p className="text-xs text-muted-foreground">Serveurs européens</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}