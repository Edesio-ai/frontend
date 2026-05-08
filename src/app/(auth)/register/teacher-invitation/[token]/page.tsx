'use client'

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GraduationCap, Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import { invitationTokenService } from "@/services/invitation-token.service";


function translateSupabaseError(message: string): string {
  const errorTranslations: Record<string, string> = {
    "Invalid login credentials": "Identifiants de connexion invalides",
    "Email not confirmed": "Adresse e-mail non confirmée",
    "User already registered": "Un compte existe déjà avec cette adresse e-mail",
    "Password should be at least 6 characters": "Le mot de passe doit contenir au moins 6 caractères",
    "Unable to validate email address: invalid format": "Format d'adresse e-mail invalide",
    "Signup requires a valid password": "Un mot de passe valide est requis",
    "To signup, please provide your email": "Veuillez fournir une adresse e-mail",
    "Email rate limit exceeded": "Trop de tentatives. Veuillez réessayer plus tard",
    "For security purposes, you can only request this once every 60 seconds": "Pour des raisons de sécurité, veuillez attendre 60 secondes avant de réessayer",
  };

  for (const [englishError, frenchError] of Object.entries(errorTranslations)) {
    if (message.toLowerCase().includes(englishError.toLowerCase())) {
      return frenchError;
    }
  }

  if (message.toLowerCase().includes("email") && message.toLowerCase().includes("invalid")) {
    return "L'adresse e-mail fournie n'est pas valide";
  }

  if (message.toLowerCase().includes("password")) {
    return "Le mot de passe fourni n'est pas valide";
  }

  if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("too many")) {
    return "Trop de tentatives. Veuillez réessayer plus tard";
  }

  return message;
}

interface InvitationData {
  maskedEmail: string;
  establishmentName: string;
  assignedChatbots: number;
}

const formSchema = z
  .object({
    firstname: z.string().min(1, "Le prénom est requis"),
    lastname: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions générales",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function TeacherInvitation() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const validateToken = async () => {
    if (!token) {
      setValidationError("Lien d'invitation invalide");
      setIsValidating(false);
      return;
    }

    try {
      const response = await invitationTokenService.getInvitationTokenPreview(token);

      setInvitationData({
        maskedEmail: response.maskedEmail,
        establishmentName: response.establishmentName,
        assignedChatbots: response.assignedChatbots || 0,
      });
      setIsValidating(false);
    } catch (err) {
      console.error("Token validation error:", err);
      setValidationError("Erreur lors de la validation de l'invitation");
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, [token]);

  const handleSignupTeacherByInvitation = async (data: FormValues) => {
    try {
      return await signUp(data.email, data.password, "teacher", data.acceptTerms, data.firstname, data.lastname, invitationData?.establishmentName, token);
    } catch (err) {
      setIsSubmitting(false);
      const translatedError = translateSupabaseError(err instanceof Error ? err.message : "Erreur inconnue");
      setErrorMessage(translatedError);
      return;
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!invitationData || !token) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    await handleSignupTeacherByInvitation(data);
    await signIn(data.email, data.password);

    router.push("/teacher");
    setErrorMessage(null);

  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validation de votre invitation...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invitation invalide</h1>
          <p className="text-muted-foreground mb-6">{validationError}</p>
          <Link href="/">
            <Button data-testid="button-back-home">Retour à l'accueil</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-signup-title">
            Créer votre compte professeur
          </h1>
          <p className="text-muted-foreground">
            Vous avez été invité(e) à rejoindre Edesio
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Invité par</p>
              <p className="font-medium">{invitationData?.establishmentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Compte Professeur</p>
              <p className="text-sm text-muted-foreground">
                Pour : {invitationData?.maskedEmail}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Invitation valide</span>
            </div>
          </div>

          {invitationData?.assignedChatbots && invitationData.assignedChatbots > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm">
                <span className="font-medium text-amber-700">{invitationData.assignedChatbots} chatbot{invitationData.assignedChatbots > 1 ? "s" : ""}</span>
                <span className="text-amber-600"> vous seront alloués par votre établissement</span>
              </p>
            </div>
          )}

          {errorMessage && (
            <div
              className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
              data-testid="text-error-message"
            >
              {errorMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jean"
                          {...field}
                          data-testid="input-signup-firstname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dupont"
                          {...field}
                          data-testid="input-signup-lastname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@ecole.fr"
                        {...field}
                        data-testid="input-signup-email"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Doit correspondre à l'adresse utilisée pour l'invitation
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-signup-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-signup-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="acceptTerms"
                        data-testid="checkbox-terms"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm font-normal cursor-pointer"
                      >
                        J'accepte les conditions générales d'utilisation
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                data-testid="button-signup-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="text-primary hover:underline"
                data-testid="link-login-bottom"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
