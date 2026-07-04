export interface CancellationTier {
  daysBeforeDeparture: number;
  refundPercentage: number;
}

export interface PaymentTerms {
  depositPercentage: number;
  fullPaymentDueDaysBeforeDeparture: number;
}

export interface BookingWindow {
  minDaysBeforeDeparture: number | null;
  maxDaysBeforeDeparture: number | null;
}

/** One PackageRule record per Package (1:1). */
export interface PackageRule {
  id: string;
  packageId: string;
  cancellationTiers: CancellationTier[];
  paymentTerms: PaymentTerms | null;
  refundPolicy: string | null;
  bookingWindow: BookingWindow | null;
  minPax: number;
  maxPax: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RuleEvaluationRequest {
  paxCount: number;
  travelDate: string;
  bookingDate?: string;
}

export interface RuleEvaluationResult {
  valid: boolean;
  violations: string[];
}
