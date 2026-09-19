/**
 * All data flowing through this engine is SYNTHETIC unless explicitly
 * documented otherwise. See /research/payment-terms-research.html for the
 * sourced industry figures the seed data's term ranges are based on.
 */

export type SupplierArchetype =
  | "parts_manufacturer"
  | "professional_services"
  | "distributor"
  | "subcontractor";

export interface SupplierProfile {
  id: string;
  name: string;
  archetype: SupplierArchetype;
  synthetic: true;
  /** Day-of-month payroll runs (e.g. [1, 15]). Informational / for narrative realism. */
  monthlyPayrollDates: number[];
  monthlyPayrollAmount: number;
  monthlyRent: number;
  monthlyVendorBills: number;
  /** Term the supplier itself gets from its own vendors. Contextual, not used in the burn calc. */
  vendorTermsDays: number;
  /** Cash on hand available above the zero floor, i.e. the safety cushion. */
  cashBuffer: number;
  /** Annual cost of capital, e.g. 0.13 = 13%. */
  costOfCapital: number;
  grossMarginPct: number;
  /** The term the supplier would ideally open a negotiation with. */
  openingAskDays: number;
  buyers: BuyerProfile[];
}

export interface BuyerProfile {
  id: string;
  name: string;
  /** The payment term this buyer has requested/imposed. */
  requestedTermDays: number;
  /** Typical monthly invoiced revenue from this buyer, used as both the cash-flow inflow and the representative single-invoice amount for carrying-cost math. */
  monthlyRevenue: number;
  /** Historical average days paid LATE beyond whatever term was agreed (0 = always on time). */
  typicalDaysLatePastTerm: number;
  /**
   * Buyer's assumed annual return on cash — what the buyer could otherwise
   * earn/avoid by holding cash longer. This is an ASSUMPTION, editable by
   * the user; it is not observed or measured. Used only to compute the
   * buyer's discount floor.
   */
  buyerReturnOnCashAssumption: number;
  /** Percentage of invoice held back until project completion (construction/subcontracting only). */
  retainagePct?: number;
  /** Which research table row backs the term range used for this buyer. */
  sourceNote: string;
}

export interface CarryingCostInput {
  amount: number;
  annualRate: number;
  days: number;
}

export interface AnnualizedDiscountInput {
  discount: number; // 0.02 = 2%
  daysEarly: number;
}

export interface BandBoundInput {
  annualRate: number;
  daysEarly: number;
}

export interface WalkAwayInput {
  cashBuffer: number;
  monthlyFixedOutflows: number;
  /** Monthly revenue from every buyer EXCEPT the one under negotiation. */
  monthlyOtherInflow: number;
  daysPerMonth?: number;
}

export interface WalkAwayResult {
  walkAwayDays: number;
  unlimited: boolean;
  dailyBurn: number;
}

export type TradeType = "early_pay_discount" | "deposit_or_price_premium";

export interface EarlyPayDiscountTrade {
  type: "early_pay_discount";
  daysEarlyVsBuyerAsk: number;
  feasible: boolean;
  supplierCeilingPct: number;
  buyerFloorPct: number;
  suggestedDiscountPct: number | null;
}

export interface CashGapTrade {
  type: "deposit_or_price_premium";
  shortfallDollars: number;
  pricePremiumPct: number;
}

export interface LadderRung {
  label: string;
  termDays: number;
  withinWalkAway: boolean;
  carryingCost: number;
  earlyPayDiscount: EarlyPayDiscountTrade | null;
  cashGapTrade: CashGapTrade | null;
}

export interface BreakEvenRiskInput {
  annualRevenueFromBuyer: number;
  grossMarginPct: number;
  costOfCapital: number;
  days: number;
}

export interface BreakEvenRiskResult {
  annualTermCost: number;
  annualGrossProfit: number;
  ratio: number;
  breachesGrossProfit: boolean;
}

export interface FactoringCostInput {
  invoiceAmount: number;
  advanceRate: number; // 0.85 = 85% advanced upfront
  feePer30Days: number; // 0.025 = 2.5% per 30-day period
  daysOutstanding: number;
}
