import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/i18n/client";

interface NewsletterFormProps {
  source?: string;
}

export function NewsletterForm({ source = "blog" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setEmail("");
        toast({
          title: t.blog.newsletterSuccess,
          description: t.blog.newsletterSuccessDesc,
        });
      } else {
        if (data.error === "already_subscribed") {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
          });
        } else {
          throw new Error(data.message || t.blog.newsletterError);
        }
      }
    } catch {
      toast({
        title: t.common.error,
        description: t.blog.newsletterError,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
        <Check className="h-5 w-5 text-emerald-400" />
        <span className="text-emerald-400 font-medium">{t.blog.newsletterSuccess}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="email"
          placeholder={t.blog.newsletterPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
          disabled={isLoading}
          data-testid="input-newsletter-email"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 whitespace-nowrap"
        data-testid="button-newsletter-subscribe"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Inscription...
          </>
        ) : (
          t.blog.newsletterSubmit
        )}
      </Button>
    </form>
  );
}
