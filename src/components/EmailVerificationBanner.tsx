import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Mail, X, Loader2, CheckCircle2 } from "lucide-react";

export function EmailVerificationBanner() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  if (!user || isEmailVerified() || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    if (!user.email) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    const { error } = await resendVerificationEmail(user.email);

    setIsResending(false);

    if (error) {
      if (error.message.includes("60 seconds")) {
        setResendError("Veuillez attendre 60 secondes avant de réessayer");
      } else if (error.message.includes("rate limit")) {
        setResendError("Trop de tentatives. Veuillez réessayer plus tard");
      } else {
        setResendError("Erreur lors de l'envoi. Veuillez réessayer");
      }
    } else {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    }
  };

  return (
    <div
      className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3"
      data-testid="banner-email-verification"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
            <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Vérifiez votre adresse e-mail
            </span>
            <span className="text-amber-700 dark:text-amber-300 ml-1 hidden sm:inline">
              pour sécuriser votre compte
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resendSuccess ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Email envoyé</span>
            </div>
          ) : resendError ? (
            <span className="text-sm text-red-600 dark:text-red-400">{resendError}</span>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending || resendSuccess}
            className="bg-white dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800/50 text-amber-800 dark:text-amber-200"
            data-testid="button-resend-verification"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              "Renvoyer l'email"
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/50"
            data-testid="button-dismiss-verification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
