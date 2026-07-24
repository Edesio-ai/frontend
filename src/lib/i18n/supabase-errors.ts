export type SupabaseErrorDictionary = {
  invalidCredentials: string;
  genericError: string;
  emailNotConfirmed: string;
  userAlreadyRegistered: string;
  passwordTooShort: string;
  invalidEmailFormat: string;
  validPasswordRequired: string;
  emailRequired: string;
  rateLimitExceeded: string;
  securityWait: string;
  invalidEmail: string;
  invalidPassword: string;
};

const matchers: { key: keyof SupabaseErrorDictionary; patterns: string[] }[] = [
  {
    key: "invalidCredentials",
    patterns: ["Invalid login credentials"],
  },
  {
    key: "genericError",
    patterns: ["An error occures. Try again later", "An error occurred"],
  },
  {
    key: "emailNotConfirmed",
    patterns: ["Email not confirmed"],
  },
  {
    key: "userAlreadyRegistered",
    patterns: ["User already registered", "A user with this email address has already been registered"],
  },
  {
    key: "passwordTooShort",
    patterns: ["Password should be at least 6 characters"],
  },
  {
    key: "invalidEmailFormat",
    patterns: ["Unable to validate email address: invalid format"],
  },
  {
    key: "validPasswordRequired",
    patterns: ["Signup requires a valid password"],
  },
  {
    key: "emailRequired",
    patterns: ["To signup, please provide your email"],
  },
  {
    key: "rateLimitExceeded",
    patterns: ["Email rate limit exceeded"],
  },
  {
    key: "securityWait",
    patterns: ["For security purposes, you can only request this once every 60 seconds"],
  },
];

/**
 * Maps raw Supabase/auth error messages to localized dictionary strings.
 * Falls back to the original message when no match is found.
 */
export function translateSupabaseError(message: string, dict: SupabaseErrorDictionary): string {
  const lower = message.toLowerCase();

  for (const { key, patterns } of matchers) {
    if (patterns.some((p) => lower.includes(p.toLowerCase()))) {
      return dict[key];
    }
  }

  if (lower.includes("email") && lower.includes("invalid")) {
    return dict.invalidEmail;
  }
  if (lower.includes("password")) {
    return dict.invalidPassword;
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return dict.rateLimitExceeded;
  }

  return message;
}
