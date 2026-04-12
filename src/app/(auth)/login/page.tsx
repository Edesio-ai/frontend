"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Connexion() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, loading, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = getUserRole();
      if (role === "teacher") {
        router.push("/teacher");
      } else if (role === "student") {
        router.push("/studer");
      } else if (role === "establishment") {
        router.push("/establishment");
      } else if (role === "standalone") {
        router.push("/standalone");
      }
    }
  }, [user, loading, getUserRole, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await signIn(email, password);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de la connexion. Vérifiez vos identifiants.r";
      setErrorMessage(message);
      setIsSubmitting(false);
      throw new Error(message);
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user = await handleLogin(data.email, data.password);
  
      setIsSubmitting(false);
      if (user) {
        const role = user.metadata?.role;
        switch(role){
          case "teacher":
            router.push("/teacher");
            break;
          case "student":
            router.push("/student");
            break;
          case "establishment":
            router.push("/establishment");
            break;
          case "standalone":
            router.push("/standalone");
            break;
          default:
            router.push("/");
            break;
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Échec de la connexion. Vérifiez vos identifiants.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-login-title">
            Connexion à Edesio
          </h1>
          <p className="text-muted-foreground">
            Accédez à votre espace personnel
          </p>
        </div>

        <Card className="p-6 md:p-8">
          {errorMessage && (
            <div
              className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
              data-testid="text-login-error"
            >
              {errorMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        data-testid="input-login-email"
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Mot de passe</FormLabel>
                      <Link
                        href="/mot-de-passe-oublie"
                        className="text-xs text-primary hover:underline"
                        data-testid="link-forgot-password"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-login-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          data-testid="button-toggle-password"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                data-testid="button-login-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline"
                data-testid="link-signup"
              >
                Créer un compte gratuitement
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
