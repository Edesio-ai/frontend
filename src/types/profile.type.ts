export interface UpdateProfileBody {
    firstname: string;
    lastname: string;
    email: string;
}

export type Subscription = {
    id: string;
    status: string;
    plan: string;
    interval: string;
    amount: number;
    currency: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    last4: string | null;
    cardBrand: string | null;
    isEstablishmentSubscription: boolean;
}