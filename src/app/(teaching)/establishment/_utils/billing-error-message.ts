export type EstablishmentBillingErrors = {
  checkoutUnavailable: string;
  checkoutFailed: string;
  validationError: string;
  subscriptionCheckFailed: string;
};

export function getBillingErrorMessage(code: string | undefined, errors: EstablishmentBillingErrors): string {
  switch (code) {
    case "VALIDATION_ERROR":
      return errors.validationError;
    default:
      return errors.checkoutFailed;
  }
}
