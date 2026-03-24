import { Card } from "@/components/ui/card";
import { GraduationCap, Building2, Users, CheckCircle2, Sparkles } from "lucide-react";

const personas = [
    {
        icon: GraduationCap,
        title: "Professeurs",
        description: "Gagnez du temps sur la création d'exercices",
        benefits: [
            "Génération automatique de questions à partir de vos cours",
            "Suivi individuel des progrès de chaque élève",
            "Plus de temps pour l'accompagnement personnalisé",
            "Rapports détaillés sur les difficultés récurrentes",
        ],
        gradient: "from-sky-400 to-indigo-500",
        bgLight: "bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30",
        iconBg: "bg-indigo-500",
        checkColor: "text-indigo-500",
    },
    {
        icon: Building2,
        title: "Responsables d'établissement",
        description: "Pilotez la réussite de vos élèves",
        benefits: [
            "Vue d'ensemble sur les performances par classe",
            "Image moderne et innovante pour l'établissement",
            "Outil différenciant pour attirer les familles",
            "Conformité RGPD et hébergement en Europe",
        ],
        gradient: "from-violet-500 to-purple-500",
        bgLight: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
        iconBg: "bg-violet-500",
        checkColor: "text-violet-500",
    },
    {
        icon: Users,
        title: "Élèves",
        description: "Révisez de manière interactive et efficace",
        benefits: [
            "Révision guidée en mode conversation naturelle",
            "Explications personnalisées selon votre niveau",
            "Disponible 24h/24 pour s'entraîner",
            "Feedback immédiat sur vos réponses",
        ],
        gradient: "from-emerald-500 to-green-500",
        bgLight: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30",
        iconBg: "bg-emerald-500",
        checkColor: "text-emerald-500",
    },
    {
        icon: Sparkles,
        title: "Apprenants autonomes",
        description: "Apprenez à votre rythme, sans contrainte",
        benefits: [
            "Créez vos propres cours et supports",
            "Générez des questions avec l'IA",
            "Entraînez-vous avec le chatbot intelligent",
            "Progressez en totale autonomie",
        ],
        gradient: "from-amber-500 to-orange-500",
        bgLight: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
        iconBg: "bg-amber-500",
        checkColor: "text-amber-500",
    },
];

export function ForWho() {
    return (
        <section
            id="pour-qui"
            className="py-20 md:py-28 lg:py-36 px-4 md:px-8 bg-white dark:bg-background relative overflow-hidden"
            data-testid="section-pour-qui"
        >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-indigo-500 via-purple-500 to-violet-500" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-20">
                    <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                        Pour qui ?
                    </span>
                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                        data-testid="text-pourqui-title"
                    >
                        Une solution pour{" "}
                        <span className="bg-gradient-to-r from-sky-400 via-indigo-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">tous</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        <span className="font-semibold text-foreground">Edesio</span> s'adresse à tous les acteurs de l'éducation, chacun y
                        trouvant des bénéfices concrets.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {personas.map((persona, index) => (
                        <Card
                            key={index}
                            className={`relative p-8 border-none shadow-lg hover:shadow-2xl transition-all duration-300 ${persona.bgLight} group`}
                            data-testid={`card-persona-${index + 1}`}
                        >
                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl ${persona.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <persona.icon className="h-8 w-8 text-white" />
                                </div>

                                <h3
                                    className="text-2xl font-bold mb-2"
                                    data-testid={`text-persona-${index + 1}-title`}
                                >
                                    {persona.title}
                                </h3>

                                <p className="text-muted-foreground mb-6 font-medium">{persona.description}</p>

                                <ul className="space-y-3">
                                    {persona.benefits.map((benefit, benefitIndex) => (
                                        <li
                                            key={benefitIndex}
                                            className="flex items-start gap-3 text-sm"
                                        >
                                            <CheckCircle2 className={`w-5 h-5 ${persona.checkColor} shrink-0 mt-0.5`} />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}