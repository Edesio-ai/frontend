import type { Locale } from "@/lib/i18n/config";
import type { LegalPageContent } from "./types";

const fr: LegalPageContent = {
  title: "Mentions Légales",
  backHome: "Retour à l'accueil",
  lastUpdated: "Dernière mise à jour : Janvier 2026",
  sections: [
    {
      title: "1. Éditeur du site",
      blocks: [
        {
          type: "p",
          text: "Le site **edesio.ai** est édité par :",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Raison sociale :** Connaiscience (Entreprise Individuelle)",
            "**SIREN :** 444 415 327",
            "**Siège social :** 50 boulevard de la Courtille, 28000 Chartres, France",
            "**Email :** contact@edesio.ai",
            "**Téléphone :** Sur demande par email",
            "**Immatriculation :** Entreprise individuelle non immatriculée au RCS",
            "**TVA :** Non assujetti à la TVA (article 293 B du CGI)",
          ],
        },
      ],
    },
    {
      title: "2. Directeur de la publication",
      blocks: [
        {
          type: "p",
          text: "Le directeur de la publication est Monsieur Frederic Seuzaret.",
        },
      ],
    },
    {
      title: "3. Hébergement",
      blocks: [
        {
          type: "p",
          text: "Le site est hébergé par :",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Replit, Inc.**",
            "548 Market St, San Francisco, CA 94104, États-Unis",
            "Site web : [https://replit.com](https://replit.com)",
          ],
        },
        {
          type: "p",
          text: "Les données sont stockées par :",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Supabase, Inc.**",
            "Serveurs situés dans l'Union Européenne",
            "Site web : [https://supabase.com](https://supabase.com)",
          ],
        },
      ],
    },
    {
      title: "4. Propriété intellectuelle",
      blocks: [
        {
          type: "p",
          text: "L'ensemble du contenu du site edesio.ai (textes, images, logos, graphismes, icônes, logiciels, bases de données) est la propriété exclusive de Connaiscience ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.",
        },
        {
          type: "p",
          text: "Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Connaiscience.",
        },
      ],
    },
    {
      title: "5. Activité",
      blocks: [
        {
          type: "p",
          text: "Edesio est une plateforme éducative basée sur l'intelligence artificielle destinée aux établissements scolaires, professeurs et élèves francophones. Elle permet aux enseignants de transformer leurs supports de cours en expériences d'apprentissage interactives grâce à la génération automatique de questions et à un chatbot pédagogique.",
        },
      ],
    },
    {
      title: "6. Données personnelles",
      blocks: [
        {
          type: "p",
          text: "Pour plus d'informations sur la collecte et le traitement des données personnelles, veuillez consulter notre [Politique de Confidentialité](/privacy-policy).",
        },
      ],
    },
    {
      title: "7. Cookies",
      blocks: [
        {
          type: "p",
          text: "Le site edesio.ai utilise des cookies techniques strictement nécessaires au fonctionnement de l'application (authentification, préférences utilisateur). Ces cookies ne collectent pas de données à des fins publicitaires.",
        },
      ],
    },
    {
      title: "8. Limitation de responsabilité",
      blocks: [
        {
          type: "p",
          text: "Connaiscience s'efforce de fournir des informations exactes et à jour sur le site edesio.ai. Toutefois, elle ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées. L'utilisateur reconnaît utiliser ces informations sous sa propre responsabilité.",
        },
        {
          type: "p",
          text: "Les contenus générés par l'intelligence artificielle sont fournis à titre pédagogique et ne sauraient se substituer à l'expertise d'un enseignant.",
        },
      ],
    },
    {
      title: "9. Droit applicable",
      blocks: [
        {
          type: "p",
          text: "Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.",
        },
      ],
    },
  ],
};

const en: LegalPageContent = {
  title: "Legal Notice",
  backHome: "Back to home",
  lastUpdated: "Last updated: January 2026",
  sections: [
    {
      title: "1. Website publisher",
      blocks: [
        {
          type: "p",
          text: "The website **edesio.ai** is published by:",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Legal name:** Connaiscience (Sole proprietorship)",
            "**SIREN:** 444 415 327",
            "**Registered office:** 50 boulevard de la Courtille, 28000 Chartres, France",
            "**Email:** contact@edesio.ai",
            "**Phone:** Available upon request by email",
            "**Registration:** Sole proprietorship not registered with the RCS",
            "**VAT:** Not subject to VAT (Article 293 B of the French Tax Code)",
          ],
        },
      ],
    },
    {
      title: "2. Publication director",
      blocks: [
        {
          type: "p",
          text: "The publication director is Mr. Frederic Seuzaret.",
        },
      ],
    },
    {
      title: "3. Hosting",
      blocks: [
        {
          type: "p",
          text: "The website is hosted by:",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Replit, Inc.**",
            "548 Market St, San Francisco, CA 94104, United States",
            "Website: [https://replit.com](https://replit.com)",
          ],
        },
        {
          type: "p",
          text: "Data is stored by:",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Supabase, Inc.**",
            "Servers located in the European Union",
            "Website: [https://supabase.com](https://supabase.com)",
          ],
        },
      ],
    },
    {
      title: "4. Intellectual property",
      blocks: [
        {
          type: "p",
          text: "All content on the edesio.ai website (texts, images, logos, graphics, icons, software, databases) is the exclusive property of Connaiscience or its partners and is protected by French and international intellectual property laws.",
        },
        {
          type: "p",
          text: "Any reproduction, representation, modification, publication, or adaptation of all or part of the website's elements, by any means or process, is prohibited without prior written authorization from Connaiscience.",
        },
      ],
    },
    {
      title: "5. Activity",
      blocks: [
        {
          type: "p",
          text: "Edesio is an AI-powered educational platform designed for schools, teachers, and students. It enables teachers to turn their course materials into interactive learning experiences through automatic question generation and an educational chatbot.",
        },
      ],
    },
    {
      title: "6. Personal data",
      blocks: [
        {
          type: "p",
          text: "For more information on the collection and processing of personal data, please see our [Privacy Policy](/privacy-policy).",
        },
      ],
    },
    {
      title: "7. Cookies",
      blocks: [
        {
          type: "p",
          text: "The edesio.ai website uses technical cookies strictly necessary for the application to function (authentication, user preferences). These cookies do not collect data for advertising purposes.",
        },
      ],
    },
    {
      title: "8. Limitation of liability",
      blocks: [
        {
          type: "p",
          text: "Connaiscience strives to provide accurate and up-to-date information on the edesio.ai website. However, it cannot guarantee the accuracy, completeness, or timeliness of the information published. Users acknowledge that they use this information under their own responsibility.",
        },
        {
          type: "p",
          text: "Content generated by artificial intelligence is provided for educational purposes and cannot replace a teacher's expertise.",
        },
      ],
    },
    {
      title: "9. Governing law",
      blocks: [
        {
          type: "p",
          text: "These legal notices are governed by French law. In the event of a dispute, French courts shall have exclusive jurisdiction.",
        },
      ],
    },
  ],
};

export function getLegalNotice(locale: Locale): LegalPageContent {
  return locale === "fr" ? fr : en;
}
