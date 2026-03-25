"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Users, ArrowLeft, Loader2, Building2, Sparkles, GraduationCap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/supabaseClient";

function translateSupabaseError(message: string): string {
  const errorTranslations: Record<string, string> = {
    "Invalid login credentials": "Identifiants de connexion invalides",
    "An error occures. Try again later": "Une erreur est survenue. Veuillez réessayer.",
    "Email not confirmed": "Adresse e-mail non confirmée",
    "A user with this email address has already been registered": "Un compte existe déjà avec cette adresse e-mail",
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

const formSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    establishment: z.string().optional(),
    invitationToken: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions générales",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      establishment: "",
      invitationToken: "",
      acceptTerms: false,
    },
  });

  const handleSignUp = async (data: FormValues) => {
    try {
      const response = await signUp(data.email, data.password, selectedRole as UserRole, data.acceptTerms, data.firstName, data.lastName, data.establishment, data.invitationToken);
      return response
    } catch (error) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : "An error occures. Try again later";
      const translatedError = translateSupabaseError(message);
      setErrorMessage(`Erreur lors de la création du compte : ${translatedError}`);
      throw new Error(translatedError);
    }
  }

  const hangleSignIn = async (email: string, password: string) => {
    try {
      const response = await signIn(email, password);
      return response
    } catch (error) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : "An error occures. Try again later";
      const translatedError = translateSupabaseError(message);
      setErrorMessage(`Compte créé mais erreur de connexion : ${translatedError}`);
      throw new Error(translatedError);
    }
  }

  const onSubmit = async (data: FormValues) => {
    const { email, password } = data;
    if (!selectedRole) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    await handleSignUp(data);
    await hangleSignIn(email, password);

    if (selectedRole === "student") {
      router.push("/student");
    } else {
      const planMapping: Record<string, string> = {
        standalone: "standalone",
        teacher: "teacher",
        establishment: "establishment",
      };
      router.push(`/choisir-plan?plan=${planMapping[selectedRole]}`);
    }
    setIsSubmitting(false);
    setErrorMessage(null);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className={`w-full ${!selectedRole ? "max-w-4xl" : "max-w-lg"}`}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-signup-title">
            Créer un compte
          </h1>
          <p className="text-muted-foreground">
            Choisissez votre profil pour adapter votre espace Edesio.
          </p>
        </div>

        {!selectedRole ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Pour les particuliers</p>
              <Card
                className={`p-6 cursor-pointer hover-elevate transition-all border-2 ${selectedRole === "standalone" ? "border-primary" : "border-transparent"
                  }`}
                onClick={() => handleRoleSelect("standalone")}
                data-testid="card-role-standalone"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Edesio Solo</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez vos propres révisions et entraînez-vous avec l'IA
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground mb-3">Pour les établissements scolaires</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card
                  className={`p-4 cursor-pointer hover-elevate transition-all border-2 h-full ${selectedRole === "student" ? "border-primary" : "border-transparent"
                    }`}
                  onClick={() => handleRoleSelect("student")}
                  data-testid="card-role-student"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Je suis élève</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rejoignez une session de votre professeur
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer hover-elevate transition-all border-2 h-full ${selectedRole === "teacher" ? "border-primary" : "border-transparent"
                    }`}
                  onClick={() => handleRoleSelect("teacher")}
                  data-testid="card-role-teacher"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Je suis professeur</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créez une classe et faites réviser vos élèves
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer hover-elevate transition-all border-2 h-full ${selectedRole === "establishment" ? "border-primary" : "border-transparent"
                    }`}
                  onClick={() => handleRoleSelect("establishment")}
                  data-testid="card-role-establishment"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Je suis un établissement</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gérez vos professeurs et suivez l'activité
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/connexion"
                  className="text-primary hover:underline"
                  data-testid="link-login"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <Card className="p-6 md:p-8">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-testid="button-back-role"
            >
              <ArrowLeft className="h-4 w-4" />
              Changer de profil
            </button>

            <div className={`flex items-center gap-3 mb-6 p-3 rounded-lg ${selectedRole === "standalone"
              ? "bg-amber-500/10 border border-amber-500/20"
              : selectedRole === "teacher"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-primary/5 border border-primary/20"
              }`}>
              {selectedRole === "student" ? (
                <Users className="h-5 w-5 text-primary" />
              ) : selectedRole === "standalone" ? (
                <Sparkles className="h-5 w-5 text-amber-600" />
              ) : selectedRole === "teacher" ? (
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium">
                {selectedRole === "student"
                  ? "Compte Élève"
                  : selectedRole === "standalone"
                    ? "Edesio Solo"
                    : selectedRole === "teacher"
                      ? "Compte Professeur"
                      : "Compte Établissement"}
              </span>
            </div>

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
                    name="firstName"
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
                    name="lastName"
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
                          placeholder="jean.dupont@education.fr"
                          {...field}
                          data-testid="input-signup-email"
                        />
                      </FormControl>
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
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-signup-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-signup-confirm-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            data-testid="button-toggle-confirm-password"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole !== "establishment" && selectedRole !== "standalone" && (
                  <FormField
                    control={form.control}
                    name="establishment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Établissement{" "}
                          <span className="text-muted-foreground font-normal">(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lycée Victor Hugo"
                            {...field}
                            data-testid="input-signup-establishment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedRole === "establishment" && (
                  <FormField
                    control={form.control}
                    name="establishment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'établissement</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lycée Victor Hugo"
                            {...field}
                            data-testid="input-signup-establishment-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                          J'accepte les{" "}
                          <Link
                            href="/cgu"
                            className="text-primary underline hover:no-underline"
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            conditions générales d'utilisation
                          </Link>
                          {" "}et la{" "}
                          <Link
                            href="/politique-confidentialite"
                            className="text-primary underline hover:no-underline"
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            politique de confidentialité
                          </Link>
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
        )}
      </div>
    </div>
  );
}