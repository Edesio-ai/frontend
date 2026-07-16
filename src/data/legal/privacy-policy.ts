import type { Locale } from "@/lib/i18n/config";
import type { LegalPageContent } from "./types";

const fr: LegalPageContent = {
  title: "Politique de Confidentialité",
  backHome: "Retour à l'accueil",
  lastUpdated: "Dernière mise à jour : Janvier 2026",
  sections: [
    {
      title: "1. Introduction",
      blocks: [
        {
          type: "p",
          text: "Connaiscience, éditeur de la plateforme **Edesio**, s'engage à protéger la vie privée des utilisateurs et à traiter leurs données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.",
        },
        {
          type: "p",
          text: "La présente politique de confidentialité a pour objet de vous informer sur la manière dont nous collectons, utilisons et protégeons vos données personnelles.",
        },
      ],
    },
    {
      title: "2. Responsable du traitement",
      blocks: [
        {
          type: "p",
          text: "Le responsable du traitement des données personnelles est :",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Raison sociale :** Connaiscience",
            "**SIREN :** 444 415 327",
            "**Adresse :** 50 boulevard de la Courtille, 28000 Chartres, France",
            "**Email :** contact@edesio.ai",
          ],
        },
      ],
    },
    {
      title: "3. Données collectées",
      blocks: [
        {
          type: "p",
          text: "Nous collectons les catégories de données suivantes selon le type d'utilisateur :",
        },
        { type: "h3", text: "3.1 Pour les établissements" },
        {
          type: "ul",
          items: [
            "Nom de l'établissement",
            "Adresse email de contact",
            "Mot de passe (chiffré)",
            "Données de connexion et d'utilisation",
          ],
        },
        { type: "h3", text: "3.2 Pour les professeurs" },
        {
          type: "ul",
          items: [
            "Nom et prénom",
            "Adresse email",
            "Mot de passe (chiffré)",
            "Contenus pédagogiques téléversés (cours, PDF)",
            "Données de connexion et d'utilisation",
          ],
        },
        { type: "h3", text: "3.3 Pour les élèves" },
        {
          type: "ul",
          items: [
            "Prénom (ou pseudonyme choisi par l'élève)",
            "Adresse email (optionnelle)",
            "Réponses aux questions pédagogiques",
            "Progression et statistiques d'apprentissage",
            "Historique des interactions avec le chatbot",
          ],
        },
      ],
    },
    {
      title: "4. Finalités du traitement",
      blocks: [
        {
          type: "p",
          text: "Vos données personnelles sont collectées et traitées pour les finalités suivantes :",
        },
        {
          type: "ul",
          items: [
            "**Gestion des comptes :** Création et administration des comptes utilisateurs",
            "**Fourniture du service :** Fonctionnement de la plateforme éducative et du chatbot IA",
            "**Suivi pédagogique :** Analyse de la progression des élèves pour les professeurs",
            "**Amélioration du service :** Optimisation de l'algorithme d'IA et de l'expérience utilisateur",
            "**Communication :** Envoi d'informations relatives au service (notifications, mises à jour)",
            "**Sécurité :** Protection contre les fraudes et utilisations abusives",
          ],
        },
      ],
    },
    {
      title: "5. Base légale du traitement",
      blocks: [
        {
          type: "p",
          text: "Nos traitements de données reposent sur les bases légales suivantes :",
        },
        {
          type: "ul",
          items: [
            "**Exécution du contrat :** Fourniture du service éducatif",
            "**Consentement :** Pour les communications marketing optionnelles",
            "**Intérêt légitime :** Amélioration du service et sécurité",
            "**Obligation légale :** Conservation de certaines données à des fins fiscales",
          ],
        },
      ],
    },
    {
      title: "6. Destinataires des données",
      blocks: [
        {
          type: "p",
          text: "Vos données peuvent être transmises aux catégories de destinataires suivants :",
        },
        {
          type: "ul",
          items: [
            "**Personnel de Connaiscience :** Pour l'administration et le support",
            "**Sous-traitants techniques :** Hébergement (Supabase, Replit), traitement IA (OpenAI)",
            "**Établissements scolaires :** Accès aux données des professeurs et élèves rattachés",
            "**Professeurs :** Accès aux données de progression de leurs élèves uniquement",
          ],
        },
        {
          type: "p",
          text: "Nous ne vendons jamais vos données personnelles à des tiers.",
        },
      ],
    },
    {
      title: "7. Transferts hors UE",
      blocks: [
        {
          type: "p",
          text: "Certaines données peuvent être traitées par des sous-traitants situés hors de l'Union Européenne :",
        },
        {
          type: "ul",
          items: [
            "**OpenAI (États-Unis) :** Traitement des contenus par l'IA pour générer les questions pédagogiques",
            "**Replit (États-Unis) :** Hébergement de l'application",
          ],
        },
        {
          type: "p",
          text: "Ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types, certifications) conformément aux exigences du RGPD.",
        },
        {
          type: "p",
          text: "Les données de la base de données sont hébergées par **Supabase** sur des serveurs situés dans l'**Union Européenne**.",
        },
      ],
    },
    {
      title: "8. Durée de conservation",
      blocks: [
        {
          type: "p",
          text: "Vos données sont conservées pour les durées suivantes :",
        },
        {
          type: "ul",
          items: [
            "**Données de compte :** Pendant toute la durée de l'utilisation du service, puis 3 ans après la dernière activité",
            "**Contenus pédagogiques :** Pendant la durée d'utilisation, supprimés sur demande du professeur",
            "**Données de progression des élèves :** Pendant l'année scolaire en cours, archivées pendant 1 an",
            "**Historique du chatbot :** 1 an maximum",
            "**Données de facturation :** 10 ans (obligation légale)",
          ],
        },
      ],
    },
    {
      title: "9. Vos droits",
      blocks: [
        {
          type: "p",
          text: "Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :",
        },
        {
          type: "ul",
          items: [
            "**Droit d'accès :** Obtenir une copie de vos données personnelles",
            "**Droit de rectification :** Corriger les données inexactes ou incomplètes",
            "**Droit à l'effacement :** Demander la suppression de vos données (« droit à l'oubli »)",
            "**Droit à la limitation :** Restreindre le traitement de vos données",
            "**Droit à la portabilité :** Recevoir vos données dans un format structuré",
            "**Droit d'opposition :** Vous opposer au traitement de vos données",
            "**Droit de retirer votre consentement :** À tout moment pour les traitements basés sur le consentement",
          ],
        },
        { type: "h3", text: "9.1 Comment exercer vos droits" },
        {
          type: "p",
          text: "Pour exercer vos droits, envoyez votre demande par email à **contact@edesio.ai** en précisant :",
        },
        {
          type: "ul",
          items: [
            "Votre nom et prénom",
            "Votre adresse email de connexion",
            "Le droit que vous souhaitez exercer",
            "Une copie d'un justificatif d'identité (pour les demandes d'accès, de rectification ou d'effacement)",
          ],
        },
        {
          type: "p",
          text: "Nous nous engageons à répondre à votre demande dans un délai d'**un mois** à compter de sa réception. Ce délai peut être prolongé de deux mois supplémentaires pour les demandes complexes, auquel cas nous vous en informerons.",
        },
        {
          type: "p",
          text: "En cas de difficulté dans l'exercice de vos droits ou de désaccord sur le traitement de vos données, vous avez le droit de déposer une réclamation auprès de la **CNIL** (Commission Nationale de l'Informatique et des Libertés) : [www.cnil.fr](https://www.cnil.fr) ou par courrier à : CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.",
        },
      ],
    },
    {
      title: "10. Sécurité des données",
      blocks: [
        {
          type: "p",
          text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction :",
        },
        {
          type: "ul",
          items: [
            "Chiffrement des données en transit (HTTPS/TLS)",
            "Chiffrement des mots de passe (hashage)",
            "Authentification sécurisée",
            "Contrôles d'accès basés sur les rôles",
            "Sauvegarde régulière des données",
            "Surveillance et journalisation des accès",
          ],
        },
      ],
    },
    {
      title: "11. Protection des mineurs",
      blocks: [
        {
          type: "p",
          text: "Edesio peut être utilisé par des mineurs dans un cadre éducatif. Nous collectons un minimum de données personnelles pour les élèves (prénom ou pseudonyme). La collecte de l'adresse email des élèves mineurs est optionnelle et soumise à l'autorisation des représentants légaux via l'établissement scolaire.",
        },
        {
          type: "p",
          text: "Les établissements et professeurs sont responsables d'informer les représentants légaux de l'utilisation de la plateforme.",
        },
      ],
    },
    {
      title: "12. Cookies",
      blocks: [
        {
          type: "p",
          text: "La plateforme Edesio utilise uniquement des cookies techniques essentiels au fonctionnement du service :",
        },
        {
          type: "ul",
          items: [
            "**Cookies d'authentification :** Maintien de la session utilisateur",
            "**Cookies de préférences :** Sauvegarde des paramètres (thème, langue)",
          ],
        },
        {
          type: "p",
          text: "Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.",
        },
      ],
    },
    {
      title: "13. Modifications de la politique",
      blocks: [
        {
          type: "p",
          text: "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour. En cas de modifications substantielles, nous vous en informerons par email ou notification sur la plateforme.",
        },
      ],
    },
    {
      title: "14. Contact",
      blocks: [
        {
          type: "p",
          text: "Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter :",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Email :** contact@edesio.ai",
            "**Adresse :** Connaiscience, 50 boulevard de la Courtille, 28000 Chartres, France",
          ],
        },
      ],
    },
  ],
};

const en: LegalPageContent = {
  title: "Privacy Policy",
  backHome: "Back to home",
  lastUpdated: "Last updated: January 2026",
  sections: [
    {
      title: "1. Introduction",
      blocks: [
        {
          type: "p",
          text: "Connaiscience, publisher of the **Edesio** platform, is committed to protecting users' privacy and processing their personal data in accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act (loi Informatique et Libertés).",
        },
        {
          type: "p",
          text: "This privacy policy explains how we collect, use, and protect your personal data.",
        },
      ],
    },
    {
      title: "2. Data controller",
      blocks: [
        {
          type: "p",
          text: "The controller of personal data is:",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Legal name:** Connaiscience",
            "**SIREN:** 444 415 327",
            "**Address:** 50 boulevard de la Courtille, 28000 Chartres, France",
            "**Email:** contact@edesio.ai",
          ],
        },
      ],
    },
    {
      title: "3. Data collected",
      blocks: [
        {
          type: "p",
          text: "We collect the following categories of data depending on the type of user:",
        },
        { type: "h3", text: "3.1 For institutions" },
        {
          type: "ul",
          items: [
            "Institution name",
            "Contact email address",
            "Password (encrypted)",
            "Login and usage data",
          ],
        },
        { type: "h3", text: "3.2 For teachers" },
        {
          type: "ul",
          items: [
            "First and last name",
            "Email address",
            "Password (encrypted)",
            "Uploaded teaching materials (courses, PDFs)",
            "Login and usage data",
          ],
        },
        { type: "h3", text: "3.3 For students" },
        {
          type: "ul",
          items: [
            "First name (or pseudonym chosen by the student)",
            "Email address (optional)",
            "Answers to educational questions",
            "Learning progress and statistics",
            "Chatbot interaction history",
          ],
        },
      ],
    },
    {
      title: "4. Purposes of processing",
      blocks: [
        {
          type: "p",
          text: "Your personal data is collected and processed for the following purposes:",
        },
        {
          type: "ul",
          items: [
            "**Account management:** Creating and administering user accounts",
            "**Service delivery:** Operating the educational platform and AI chatbot",
            "**Educational tracking:** Analyzing student progress for teachers",
            "**Service improvement:** Optimizing the AI algorithm and user experience",
            "**Communication:** Sending service-related information (notifications, updates)",
            "**Security:** Protection against fraud and abusive use",
          ],
        },
      ],
    },
    {
      title: "5. Legal basis for processing",
      blocks: [
        {
          type: "p",
          text: "Our data processing is based on the following legal grounds:",
        },
        {
          type: "ul",
          items: [
            "**Performance of a contract:** Providing the educational service",
            "**Consent:** For optional marketing communications",
            "**Legitimate interest:** Service improvement and security",
            "**Legal obligation:** Retaining certain data for tax purposes",
          ],
        },
      ],
    },
    {
      title: "6. Recipients of data",
      blocks: [
        {
          type: "p",
          text: "Your data may be shared with the following categories of recipients:",
        },
        {
          type: "ul",
          items: [
            "**Connaiscience staff:** For administration and support",
            "**Technical subprocessors:** Hosting (Supabase, Replit), AI processing (OpenAI)",
            "**Educational institutions:** Access to data of affiliated teachers and students",
            "**Teachers:** Access only to their students' progress data",
          ],
        },
        {
          type: "p",
          text: "We never sell your personal data to third parties.",
        },
      ],
    },
    {
      title: "7. Transfers outside the EU",
      blocks: [
        {
          type: "p",
          text: "Some data may be processed by subprocessors located outside the European Union:",
        },
        {
          type: "ul",
          items: [
            "**OpenAI (United States):** AI processing of content to generate educational questions",
            "**Replit (United States):** Application hosting",
          ],
        },
        {
          type: "p",
          text: "These transfers are framed by appropriate safeguards (standard contractual clauses, certifications) in accordance with GDPR requirements.",
        },
        {
          type: "p",
          text: "Database data is hosted by **Supabase** on servers located in the **European Union**.",
        },
      ],
    },
    {
      title: "8. Retention period",
      blocks: [
        {
          type: "p",
          text: "Your data is retained for the following periods:",
        },
        {
          type: "ul",
          items: [
            "**Account data:** For the entire duration of service use, then 3 years after the last activity",
            "**Teaching materials:** For the duration of use, deleted upon the teacher's request",
            "**Student progress data:** For the current school year, archived for 1 year",
            "**Chatbot history:** Maximum 1 year",
            "**Billing data:** 10 years (legal obligation)",
          ],
        },
      ],
    },
    {
      title: "9. Your rights",
      blocks: [
        {
          type: "p",
          text: "Under the GDPR, you have the following rights regarding your personal data:",
        },
        {
          type: "ul",
          items: [
            "**Right of access:** Obtain a copy of your personal data",
            "**Right to rectification:** Correct inaccurate or incomplete data",
            "**Right to erasure:** Request deletion of your data (“right to be forgotten”)",
            "**Right to restriction:** Restrict the processing of your data",
            "**Right to data portability:** Receive your data in a structured format",
            "**Right to object:** Object to the processing of your data",
            "**Right to withdraw consent:** At any time for processing based on consent",
          ],
        },
        { type: "h3", text: "9.1 How to exercise your rights" },
        {
          type: "p",
          text: "To exercise your rights, send your request by email to **contact@edesio.ai**, specifying:",
        },
        {
          type: "ul",
          items: [
            "Your first and last name",
            "Your login email address",
            "The right you wish to exercise",
            "A copy of an identity document (for access, rectification, or erasure requests)",
          ],
        },
        {
          type: "p",
          text: "We commit to responding to your request within **one month** of receipt. This period may be extended by two additional months for complex requests, in which case we will inform you.",
        },
        {
          type: "p",
          text: "If you encounter difficulties exercising your rights or disagree with how your data is processed, you have the right to lodge a complaint with the **CNIL** (French Data Protection Authority): [www.cnil.fr](https://www.cnil.fr) or by mail to: CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.",
        },
      ],
    },
    {
      title: "10. Data security",
      blocks: [
        {
          type: "p",
          text: "We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction:",
        },
        {
          type: "ul",
          items: [
            "Encryption of data in transit (HTTPS/TLS)",
            "Password encryption (hashing)",
            "Secure authentication",
            "Role-based access controls",
            "Regular data backups",
            "Access monitoring and logging",
          ],
        },
      ],
    },
    {
      title: "11. Protection of minors",
      blocks: [
        {
          type: "p",
          text: "Edesio may be used by minors in an educational context. We collect a minimum of personal data for students (first name or pseudonym). Collection of email addresses from minor students is optional and subject to authorization by legal guardians through the educational institution.",
        },
        {
          type: "p",
          text: "Institutions and teachers are responsible for informing legal guardians about the use of the platform.",
        },
      ],
    },
    {
      title: "12. Cookies",
      blocks: [
        {
          type: "p",
          text: "The Edesio platform uses only technical cookies essential to the operation of the service:",
        },
        {
          type: "ul",
          items: [
            "**Authentication cookies:** Maintaining the user session",
            "**Preference cookies:** Saving settings (theme, language)",
          ],
        },
        {
          type: "p",
          text: "We do not use advertising cookies or third-party tracking.",
        },
      ],
    },
    {
      title: "13. Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "We reserve the right to modify this privacy policy at any time. Changes will be published on this page with the update date. In the event of substantial changes, we will notify you by email or through a notification on the platform.",
        },
      ],
    },
    {
      title: "14. Contact",
      blocks: [
        {
          type: "p",
          text: "For any questions about this privacy policy or to exercise your rights, you can contact us:",
        },
        {
          type: "ul",
          style: "none",
          items: [
            "**Email:** contact@edesio.ai",
            "**Address:** Connaiscience, 50 boulevard de la Courtille, 28000 Chartres, France",
          ],
        },
      ],
    },
  ],
};

export function getPrivacyPolicy(locale: Locale): LegalPageContent {
  return locale === "fr" ? fr : en;
}
