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
import { useTranslations } from "@/lib/i18n/client";

export function DemoForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();
  const dt = t.demoForm;

  const formSchema = z
    .object({
      firstName: z.string().min(1, "Required"),
      lastName: z.string().min(1, "Required"),
      establishment: z.string().min(1, "Required"),
      email: z.string().email("Invalid email"),
      establishmentType: z.string().min(1, "Required"),
      message: z.string().optional(),
      wantsFreeAccount: z.boolean(),
      wantsDemo: z.boolean(),
    })
    .refine((data) => data.wantsFreeAccount || data.wantsDemo, {
      message: "Please select at least one option",
      path: ["wantsDemo"],
    });

  type FormValues = z.infer<typeof formSchema>;

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
        throw new Error(errorData.error || dt.sendError);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: dt.toastErrorTitle,
        description: error instanceof Error ? error.message : dt.toastErrorDefault,
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
              {dt.successTitle}
            </h3>
            <p
              className="text-muted-foreground"
              data-testid="text-success-message"
            >
              {dt.successMessage}
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
            {dt.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {dt.subtitle}
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
                      <FormLabel>{dt.firstName}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={dt.firstNamePlaceholder}
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
                      <FormLabel>{dt.lastName}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={dt.lastNamePlaceholder}
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
                    <FormLabel>{dt.establishment}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dt.establishmentPlaceholder}
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
                    <FormLabel>{dt.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={dt.emailPlaceholder}
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
                    <FormLabel>{dt.establishmentType}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-establishment-type">
                          <SelectValue placeholder={dt.selectType} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="college">{dt.typeCollege}</SelectItem>
                        <SelectItem value="lycee">{dt.typeLycee}</SelectItem>
                        <SelectItem value="superieur">{dt.typeSuperieur}</SelectItem>
                        <SelectItem value="autre">{dt.typeAutre}</SelectItem>
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
                    <FormLabel>{dt.message}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={dt.messagePlaceholder}
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
                        {dt.wantsFreeAccount}
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
                          {dt.wantsDemo}
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
                    {dt.submitting}
                  </>
                ) : (
                  dt.submit
                )}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
}
