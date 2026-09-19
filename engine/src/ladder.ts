import { bandBound, carryingCost } from "./formulas.js";
import type { CashGapTrade, EarlyPayDiscountTrade, LadderRung } from "./types.js";

export interface BuildLadderInput {
  invoiceAmount: number;
  buyerAskDays: number;
  openingAskDays: number;
  walkAwayDays: number;
  supplierCostOfCapital: number;
  buyerReturnOnCashAssumption: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function buildEarlyPayDiscount(
  termDays: number,
  buyerAskDays: number,
  supplierCostOfCapital: number,
  buyerReturnOnCashAssumption: number
): EarlyPayDiscountTrade | null {
  const daysEarly = buyerAskDays - termDays;
  if (daysEarly <= 0) return null;

  const ceiling = bandBound(supplierCostOfCapital, daysEarly);
  const floor = bandBound(buyerReturnOnCashAssumption, daysEarly);
  const feasible = ceiling >= floor;

  return {
    type: "early_pay_discount",
    daysEarlyVsBuyerAsk: daysEarly,
    feasible,
    supplierCeilingPct: round4(ceiling),
    buyerFloorPct: round4(floor),
    suggestedDiscountPct: feasible ? round4((ceiling + floor) / 2) : null,
  };
}

function buildCashGapTrade(
  termDays: number,
  walkAwayDays: number,
  invoiceAmount: number,
  supplierCostOfCapital: number
): CashGapTrade | null {
  if (termDays <= walkAwayDays) return null;

  const shortfallDollars =
    carryingCost(invoiceAmount, supplierCostOfCapital, termDays) -
    carryingCost(invoiceAmount, supplierCostOfCapital, walkAwayDays);

  return {
    type: "deposit_or_price_premium",
    shortfallDollars: round2(shortfallDollars),
    pricePremiumPct: round4(shortfallDollars / invoiceAmount),
  };
}

function buildRung(
  label: string,
  termDays: number,
  input: BuildLadderInput
): LadderRung {
  const { invoiceAmount, buyerAskDays, walkAwayDays, supplierCostOfCapital, buyerReturnOnCashAssumption } =
    input;

  return {
    label,
    termDays,
    withinWalkAway: termDays <= walkAwayDays,
    carryingCost: round2(carryingCost(invoiceAmount, supplierCostOfCapital, termDays)),
    earlyPayDiscount: buildEarlyPayDiscount(
      termDays,
      buyerAskDays,
      supplierCostOfCapital,
      buyerReturnOnCashAssumption
    ),
    cashGapTrade: buildCashGapTrade(termDays, walkAwayDays, invoiceAmount, supplierCostOfCapital),
  };
}

/**
 * Builds a four-rung negotiation ladder: opening ask -> a first concession
 * one-third of the way to the buyer's ask -> the midpoint between opening
 * ask and buyer's ask -> the walk-away line itself.
 *
 * Every rung shorter than the buyer's ask carries a priced early-pay
 * discount trade (supplier ceiling vs. buyer floor, per bandBound). Any
 * rung whose term falls OUTSIDE the walk-away line -- i.e. the supplier
 * cannot actually afford to wait that long even with a sweetener -- also
 * gets a cash-gap trade (a deposit or price premium sized to the exact
 * shortfall), per the spec: "add trades if the midpoint is outside the
 * limit."
 */
export function buildLadder(input: BuildLadderInput): LadderRung[] {
  const { openingAskDays, buyerAskDays, walkAwayDays } = input;

  const concession1Days = Math.round(openingAskDays + (buyerAskDays - openingAskDays) / 3);
  const midpointDays = Math.round((openingAskDays + buyerAskDays) / 2);

  return [
    buildRung("Opening ask", openingAskDays, input),
    buildRung("Concession 1", concession1Days, input),
    buildRung("Midpoint", midpointDays, input),
    buildRung("Walk-away", walkAwayDays, input),
  ];
}
