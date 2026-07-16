import type { Locale } from "@/lib/i18n/config";
import type { LegalPageContent } from "./types";

const fr: LegalPageContent = {
  title: "Conditions Générales d'Utilisation",
  backHome: "Retour à l'accueil",
  lastUpdated: "Dernière mise à jour : Janvier 2026",
  sections: [
    {
      title: "1. Objet",
      blocks: [
        {
          type: "p",
          text: "Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités d'accès et d'utilisation de la plateforme **Edesio**, accessible à l'adresse **edesio.ai**, éditée par Connaiscience.",
        },
        {
          type: "p",
          text: "Edesio est une plateforme éducative utilisant l'intelligence artificielle, permettant aux professeurs de créer des contenus pédagogiques interactifs et aux élèves d'apprendre de manière engageante.",
        },
      ],
    },
    {
      title: "2. Acceptation des CGU",
      blocks: [
        {
          type: "p",
          text: "L'inscription et l'utilisation de la plateforme Edesio impliquent l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.",
        },
        {
          type: "p",
          text: "Connaiscience se réserve le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés des modifications par notification sur la plateforme ou par email.",
        },
      ],
    },
    {
      title: "3. Description des services",
      blocks: [
        {
          type: "p",
          text: "Edesio propose les services suivants :",
        },
        {
          type: "ul",
          items: [
            "**Pour les établissements :** Gestion des comptes professeurs, statistiques globales, codes d'invitation",
            "**Pour les professeurs :** Création de sessions et de cours, téléversement de supports pédagogiques (PDF, texte), génération automatique de questions par IA, suivi des progrès des élèves",
            "**Pour les élèves :** Accès aux cours via code de session, interaction avec un chatbot pédagogique, réponse aux questions générées, suivi de leur progression",
            "**Edesio Solo :** Accès direct pour les apprenants autonomes sans rattachement à un établissement",
          ],
        },
      ],
    },
    {
      title: "4. Inscription et compte utilisateur",
      blocks: [
        { type: "h3", text: "4.1 Création de compte" },
        {
          type: "p",
          text: "L'accès à certaines fonctionnalités de la plateforme nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.",
        },
        { type: "h3", text: "4.2 Types de comptes" },
        {
          type: "ul",
          items: [
            "**Compte Établissement :** Réservé aux administrateurs d'établissements scolaires",
            "**Compte Professeur :** Créé via invitation d'un établissement ou en mode autonome",
            "**Compte Élève :** Créé lors de la première connexion avec un code de session valide",
          ],
        },
        { type: "h3", text: "4.3 Sécurité du compte" },
        {
          type: "p",
          text: "L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation de son compte est présumée être faite par lui-même.",
        },
      ],
    },
    {
      title: "5. Obligations des utilisateurs",
      blocks: [
        { type: "h3", text: "5.1 Obligations générales" },
        {
          type: "p",
          text: "L'utilisateur s'engage à :",
        },
        {
          type: "ul",
          items: [
            "Utiliser la plateforme conformément à sa destination éducative",
            "Ne pas porter atteinte à l'intégrité ou au fonctionnement de la plateforme",
            "Ne pas utiliser la plateforme à des fins illicites ou contraires aux bonnes mœurs",
            "Respecter les droits de propriété intellectuelle",
            "Ne pas tenter de contourner les mesures de sécurité",
          ],
        },
        { type: "h3", text: "5.2 Obligations spécifiques aux professeurs" },
        {
          type: "p",
          text: "Les professeurs s'engagent à :",
        },
        {
          type: "ul",
          items: [
            "Téléverser uniquement des contenus dont ils détiennent les droits ou qui sont libres de droits",
            "Vérifier et valider les questions générées par l'IA avant de les proposer aux élèves",
            "Respecter la confidentialité des données de leurs élèves",
            "Utiliser les codes de session de manière responsable",
          ],
        },
        { type: "h3", text: "5.3 Obligations spécifiques aux élèves" },
        {
          type: "p",
          text: "Les élèves s'engagent à :",
        },
        {
          type: "ul",
          items: [
            "Ne pas partager les codes de session avec des personnes non autorisées",
            "Utiliser la plateforme dans un cadre strictement éducatif",
            "Interagir de manière respectueuse avec le chatbot et les contenus proposés",
          ],
        },
      ],
    },
    {
      title: "6. Contenus générés par l'IA",
      blocks: [
        {
          type: "p",
          text: "Edesio utilise des technologies d'intelligence artificielle pour générer des questions pédagogiques à partir des supports de cours fournis par les professeurs.",
        },
        {
          type: "ul",
          items: [
            "Les contenus générés par l'IA sont fournis à titre d'aide pédagogique",
            "Les professeurs restent responsables de la validation des questions avant leur utilisation",
            "Connaiscience ne garantit pas l'exactitude absolue des contenus générés",
            "L'IA ne remplace pas l'expertise et le jugement professionnel des enseignants",
          ],
        },
      ],
    },
    {
      title: "7. Propriété intellectuelle",
      blocks: [
        { type: "h3", text: "7.1 Contenus de la plateforme" },
        {
          type: "p",
          text: "La plateforme Edesio et tous ses éléments (code, design, textes, logos) sont la propriété exclusive de Connaiscience et sont protégés par le droit de la propriété intellectuelle.",
        },
        { type: "h3", text: "7.2 Contenus des utilisateurs" },
        {
          type: "p",
          text: "Les utilisateurs conservent la propriété de leurs contenus téléversés (cours, supports pédagogiques). En téléversant du contenu, l'utilisateur accorde à Connaiscience une licence non exclusive pour traiter ce contenu dans le cadre du fonctionnement de la plateforme.",
        },
      ],
    },
    {
      title: "8. Suggestions et contenus générés par les utilisateurs",
      blocks: [
        {
          type: "p",
          text: "La plateforme permet aux utilisateurs de soumettre des suggestions d'amélioration et de voter pour celles-ci.",
        },
        { type: "h3", text: "8.1 Règles de publication" },
        {
          type: "ul",
          items: [
            "Les suggestions doivent être constructives et respectueuses",
            "Tout contenu injurieux, diffamatoire ou contraire aux bonnes mœurs est interdit",
            "Les utilisateurs sont responsables du contenu qu'ils publient",
            "Seul l'auteur d'une suggestion peut la supprimer",
          ],
        },
        { type: "h3", text: "8.2 Modération" },
        {
          type: "p",
          text: "Connaiscience se réserve le droit de supprimer tout contenu inapproprié sans préavis. Les utilisateurs peuvent signaler les contenus problématiques à contact@edesio.ai.",
        },
        { type: "h3", text: "8.3 Propriété des suggestions" },
        {
          type: "p",
          text: "En soumettant une suggestion, l'utilisateur accorde à Connaiscience le droit d'utiliser, modifier et implémenter cette suggestion sans contrepartie.",
        },
      ],
    },
    {
      title: "9. Protection des mineurs",
      blocks: [
        {
          type: "p",
          text: "Edesio est destiné à un usage éducatif et peut être utilisé par des mineurs dans le cadre scolaire. L'utilisation par des mineurs est placée sous la responsabilité des établissements scolaires, des professeurs et des représentants légaux.",
        },
        {
          type: "p",
          text: "Les contenus de la plateforme sont adaptés à un public scolaire et ne contiennent pas d'éléments inappropriés pour les mineurs.",
        },
      ],
    },
    {
      title: "10. Tarification",
      blocks: [
        {
          type: "p",
          text: "Les tarifs et modalités de paiement sont présentés sur la page « Tarifs » du site. Connaiscience se réserve le droit de modifier ses tarifs à tout moment, les modifications n'affectant pas les abonnements en cours.",
        },
      ],
    },
    {
      title: "11. Limitation de responsabilité",
      blocks: [
        {
          type: "p",
          text: "Connaiscience s'efforce d'assurer la disponibilité et le bon fonctionnement de la plateforme mais ne peut garantir une disponibilité permanente. La responsabilité de Connaiscience ne saurait être engagée en cas de :",
        },
        {
          type: "ul",
          items: [
            "Interruption temporaire du service pour maintenance",
            "Dysfonctionnements liés à des causes externes (hébergeur, réseau, etc.)",
            "Perte de données due à un usage non conforme",
            "Utilisation incorrecte des contenus générés par l'IA",
          ],
        },
      ],
    },
    {
      title: "12. Résiliation",
      blocks: [
        {
          type: "p",
          text: "L'utilisateur peut résilier son compte à tout moment en contactant le support à contact@edesio.ai. Connaiscience se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de violation des présentes CGU.",
        },
      ],
    },
    {
      title: "13. Droit applicable et juridiction",
      blocks: [
        {
          type: "p",
          text: "Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents seront ceux du ressort du siège social de Connaiscience.",
        },
      ],
    },
    {
      title: "14. Contact",
      blocks: [
        {
          type: "p",
          text: "Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Email :** contact@edesio.ai",
            "**Adresse :** 50 boulevard de la Courtille, 28000 Chartres, France",
          ],
        },
      ],
    },
  ],
};

const en: LegalPageContent = {
  title: "Terms of Service",
  backHome: "Back to home",
  lastUpdated: "Last updated: January 2026",
  sections: [
    {
      title: "1. Purpose",
      blocks: [
        {
          type: "p",
          text: "These Terms of Service (ToS) define the terms of access to and use of the **Edesio** platform, available at **edesio.ai**, published by Connaiscience.",
        },
        {
          type: "p",
          text: "Edesio is an educational platform using artificial intelligence that enables teachers to create interactive educational content and students to learn in an engaging way.",
        },
      ],
    },
    {
      title: "2. Acceptance of the Terms",
      blocks: [
        {
          type: "p",
          text: "Registering for and using the Edesio platform implies full acceptance of these Terms. If you do not accept these conditions, you must not use the platform.",
        },
        {
          type: "p",
          text: "Connaiscience reserves the right to modify these Terms at any time. Users will be informed of changes by notification on the platform or by email.",
        },
      ],
    },
    {
      title: "3. Description of services",
      blocks: [
        {
          type: "p",
          text: "Edesio offers the following services:",
        },
        {
          type: "ul",
          items: [
            "**For institutions:** Teacher account management, global statistics, invitation codes",
            "**For teachers:** Creating sessions and courses, uploading teaching materials (PDF, text), automatic AI question generation, tracking student progress",
            "**For students:** Accessing courses via session code, interacting with an educational chatbot, answering generated questions, tracking their progress",
            "**Edesio Solo:** Direct access for independent learners without affiliation to an institution",
          ],
        },
      ],
    },
    {
      title: "4. Registration and user account",
      blocks: [
        { type: "h3", text: "4.1 Account creation" },
        {
          type: "p",
          text: "Access to certain platform features requires creating a user account. The user agrees to provide accurate information and keep it up to date.",
        },
        { type: "h3", text: "4.2 Account types" },
        {
          type: "ul",
          items: [
            "**Institution account:** Reserved for school administrators",
            "**Teacher account:** Created via an institution invitation or in independent mode",
            "**Student account:** Created on first login with a valid session code",
          ],
        },
        { type: "h3", text: "4.3 Account security" },
        {
          type: "p",
          text: "The user is responsible for the confidentiality of their login credentials. Any use of their account is presumed to be made by them.",
        },
      ],
    },
    {
      title: "5. User obligations",
      blocks: [
        { type: "h3", text: "5.1 General obligations" },
        {
          type: "p",
          text: "The user agrees to:",
        },
        {
          type: "ul",
          items: [
            "Use the platform in accordance with its educational purpose",
            "Not compromise the integrity or operation of the platform",
            "Not use the platform for unlawful purposes or purposes contrary to public morals",
            "Respect intellectual property rights",
            "Not attempt to circumvent security measures",
          ],
        },
        { type: "h3", text: "5.2 Specific obligations for teachers" },
        {
          type: "p",
          text: "Teachers agree to:",
        },
        {
          type: "ul",
          items: [
            "Upload only content for which they hold the rights or that is free of rights",
            "Review and validate AI-generated questions before offering them to students",
            "Respect the confidentiality of their students' data",
            "Use session codes responsibly",
          ],
        },
        { type: "h3", text: "5.3 Specific obligations for students" },
        {
          type: "p",
          text: "Students agree to:",
        },
        {
          type: "ul",
          items: [
            "Not share session codes with unauthorized persons",
            "Use the platform strictly for educational purposes",
            "Interact respectfully with the chatbot and the content provided",
          ],
        },
      ],
    },
    {
      title: "6. AI-generated content",
      blocks: [
        {
          type: "p",
          text: "Edesio uses artificial intelligence technologies to generate educational questions from course materials provided by teachers.",
        },
        {
          type: "ul",
          items: [
            "AI-generated content is provided as a pedagogical aid",
            "Teachers remain responsible for validating questions before use",
            "Connaiscience does not guarantee the absolute accuracy of generated content",
            "AI does not replace teachers' expertise and professional judgment",
          ],
        },
      ],
    },
    {
      title: "7. Intellectual property",
      blocks: [
        { type: "h3", text: "7.1 Platform content" },
        {
          type: "p",
          text: "The Edesio platform and all its elements (code, design, texts, logos) are the exclusive property of Connaiscience and are protected by intellectual property law.",
        },
        { type: "h3", text: "7.2 User content" },
        {
          type: "p",
          text: "Users retain ownership of their uploaded content (courses, teaching materials). By uploading content, the user grants Connaiscience a non-exclusive license to process that content for the operation of the platform.",
        },
      ],
    },
    {
      title: "8. Suggestions and user-generated content",
      blocks: [
        {
          type: "p",
          text: "The platform allows users to submit improvement suggestions and vote on them.",
        },
        { type: "h3", text: "8.1 Publication rules" },
        {
          type: "ul",
          items: [
            "Suggestions must be constructive and respectful",
            "Any abusive, defamatory, or immoral content is prohibited",
            "Users are responsible for the content they publish",
            "Only the author of a suggestion may delete it",
          ],
        },
        { type: "h3", text: "8.2 Moderation" },
        {
          type: "p",
          text: "Connaiscience reserves the right to remove any inappropriate content without notice. Users may report problematic content to contact@edesio.ai.",
        },
        { type: "h3", text: "8.3 Ownership of suggestions" },
        {
          type: "p",
          text: "By submitting a suggestion, the user grants Connaiscience the right to use, modify, and implement that suggestion without compensation.",
        },
      ],
    },
    {
      title: "9. Protection of minors",
      blocks: [
        {
          type: "p",
          text: "Edesio is intended for educational use and may be used by minors in a school context. Use by minors is under the responsibility of educational institutions, teachers, and legal guardians.",
        },
        {
          type: "p",
          text: "Platform content is suitable for a school audience and does not contain elements inappropriate for minors.",
        },
      ],
    },
    {
      title: "10. Pricing",
      blocks: [
        {
          type: "p",
          text: "Prices and payment terms are presented on the “Pricing” page of the website. Connaiscience reserves the right to modify its prices at any time; changes do not affect ongoing subscriptions.",
        },
      ],
    },
    {
      title: "11. Limitation of liability",
      blocks: [
        {
          type: "p",
          text: "Connaiscience strives to ensure the availability and proper functioning of the platform but cannot guarantee permanent availability. Connaiscience shall not be liable in the event of:",
        },
        {
          type: "ul",
          items: [
            "Temporary service interruption for maintenance",
            "Malfunctions related to external causes (host, network, etc.)",
            "Data loss due to non-compliant use",
            "Incorrect use of AI-generated content",
          ],
        },
      ],
    },
    {
      title: "12. Termination",
      blocks: [
        {
          type: "p",
          text: "Users may terminate their account at any time by contacting support at contact@edesio.ai. Connaiscience reserves the right to suspend or terminate a user's access in the event of a violation of these Terms.",
        },
      ],
    },
    {
      title: "13. Governing law and jurisdiction",
      blocks: [
        {
          type: "p",
          text: "These Terms are governed by French law. In the event of a dispute, and after an attempt at amicable resolution, the competent courts shall be those of the jurisdiction of Connaiscience's registered office.",
        },
      ],
    },
    {
      title: "14. Contact",
      blocks: [
        {
          type: "p",
          text: "For any questions about these Terms, you can contact us at:",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Email:** contact@edesio.ai",
            "**Address:** 50 boulevard de la Courtille, 28000 Chartres, France",
          ],
        },
      ],
    },
  ],
};

export function getTermsOfService(locale: Locale): LegalPageContent {
  return locale === "fr" ? fr : en;
}
