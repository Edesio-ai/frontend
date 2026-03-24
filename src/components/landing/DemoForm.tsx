"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const formSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    establishment: z.string().min(1, "L'établissement est requis"),
    email: z.string().email("Adresse email invalide"),
    establishmentType: z.string().min(1, "Veuillez sélectionner un type"),
    message: z.string().optional(),
    wantsFreeAccount: z.boolean(),
    wantsDemo: z.boolean(),
  })
  .refine((data) => data.wantsFreeAccount || data.wantsDemo, {
    message: "Veuillez sélectionner au moins une option",
    path: ["wantsDemo"],
  });

type FormValues = z.infer<typeof formSchema>;

export function DemoForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      establishment: "",
      email: "",
      establishmentType: "",
      message: "",
      wantsFreeAccount: false,
      wantsDemo: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section
        id="demo"
        className="py-16 md:py-24 lg:py-32 px-4 md:px-8"
        data-testid="section-demo"
      >
        <div id="signup" />
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3
              className="text-2xl font-bold mb-4"
              data-testid="text-success-title"
            >
              Merci pour votre demande !
            </h3>
            <p
              className="text-muted-foreground"
              data-testid="text-success-message"
            >
              Un email de confirmation vous a été envoyé. Notre équipe vous répondra dans un délai de 24 heures maximum, hors week-ends.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section
      id="demo"
      className="py-16 md:py-24 lg:py-32 px-4 md:px-8"
      data-testid="section-demo"
    >
      <div id="signup" />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            data-testid="text-demo-title"
          >
            Planifier une démo ou créer un compte gratuit
          </h2>
          <p className="text-lg text-muted-foreground">
            Remplissez ce formulaire et nous vous recontacterons rapidement.
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              data-testid="form-demo"
            >
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
                          data-testid="input-firstname"
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
                          data-testid="input-lastname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="establishment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Établissement</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lycée Victor Hugo"
                        {...field}
                        data-testid="input-establishment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail professionnel</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@education.fr"
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="establishmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'établissement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-establishment-type">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="college">Collège</SelectItem>
                        <SelectItem value="lycee">Lycée</SelectItem>
                        <SelectItem value="superieur">
                          Enseignement supérieur
                        </SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez votre projet ou posez-nous vos questions..."
                        className="min-h-[100px] resize-none"
                        {...field}
                        data-testid="textarea-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="wantsFreeAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="wantsFreeAccount"
                          data-testid="checkbox-free-account"
                        />
                      </FormControl>
                      <label
                        htmlFor="wantsFreeAccount"
                        className="text-sm font-normal leading-relaxed cursor-pointer"
                      >
                        Je souhaite créer un compte de test gratuit
                      </label>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wantsDemo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="wantsDemo"
                          data-testid="checkbox-demo"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label
                          htmlFor="wantsDemo"
                          className="text-sm font-normal leading-relaxed cursor-pointer"
                        >
                          Je souhaite d'abord une démonstration
                        </label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer ma demande"
                )}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
}