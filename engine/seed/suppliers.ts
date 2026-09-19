/**
 * SYNTHETIC SEED DATA -- every supplier, buyer, and dollar figure in this
 * file is fabricated for demo purposes. None of it describes a real
 * company. Term/DSO ranges are anchored to the industry table in
 * /research/payment-terms-research.html (section 01, "What net terms
 * actually look like, by industry") -- see each buyer's `sourceNote`.
 */
import type { SupplierProfile } from "../src/types.js";

export const suppliers: SupplierProfile[] = [
  {
    id: "cascade-precision-parts",
    name: "Cascade Precision Parts (synthetic)",
    archetype: "parts_manufacturer",
    synthetic: true,
    monthlyPayrollDates: [1, 15],
    monthlyPayrollAmount: 42000,
    monthlyRent: 6500,
    monthlyVendorBills: 18000,
    vendorTermsDays: 30,
    cashBuffer: 65000,
    costOfCapital: 0.13,
    grossMarginPct: 0.22,
    openingAskDays: 30,
    buyers: [
      {
        id: "highline-auto-systems",
        name: "Highline Auto Systems (synthetic)",
        requestedTermDays: 90,
        monthlyRevenue: 85000,
        typicalDaysLatePastTerm: 5,
        buyerReturnOnCashAssumption: 0.04,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Manufacturing (parts/components to OEMs)': contracted Net 60/Net 90, realized DSO 45–60 days.",
      },
      {
        id: "vantage-farm-equipment",
        name: "Vantage Farm Equipment (synthetic)",
        requestedTermDays: 60,
        monthlyRevenue: 40000,
        typicalDaysLatePastTerm: 0,
        buyerReturnOnCashAssumption: 0.035,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Manufacturing (parts/components to OEMs)': contracted Net 60/Net 90, realized DSO 45–60 days.",
      },
      {
        id: "bolt-and-frame-coop",
        name: "Bolt & Frame Co-op (synthetic)",
        requestedTermDays: 45,
        monthlyRevenue: 15000,
        typicalDaysLatePastTerm: 12,
        buyerReturnOnCashAssumption: 0.05,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Manufacturing (parts/components to OEMs)': contracted Net 60/Net 90, realized DSO 45–60 days.",
      },
    ],
  },
  {
    id: "meridian-ops-consulting",
    name: "Meridian Ops Consulting (synthetic)",
    archetype: "professional_services",
    synthetic: true,
    monthlyPayrollDates: [1, 15],
    monthlyPayrollAmount: 58000,
    monthlyRent: 4200,
    monthlyVendorBills: 3200,
    vendorTermsDays: 15,
    cashBuffer: 40000,
    costOfCapital: 0.11,
    grossMarginPct: 0.45,
    openingAskDays: 15,
    buyers: [
      {
        id: "northfield-retail-group",
        name: "Northfield Retail Group (synthetic)",
        requestedTermDays: 60,
        monthlyRevenue: 32000,
        typicalDaysLatePastTerm: 8,
        buyerReturnOnCashAssumption: 0.04,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Professional services': contracted Net 30/Net 45, realized DSO 45–65 days.",
      },
      {
        id: "ashford-health-systems",
        name: "Ashford Health Systems (synthetic)",
        requestedTermDays: 45,
        monthlyRevenue: 26000,
        typicalDaysLatePastTerm: 0,
        buyerReturnOnCashAssumption: 0.03,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Professional services': contracted Net 30/Net 45, realized DSO 45–65 days.",
      },
      {
        id: "petra-logistics",
        name: "Petra Logistics (synthetic)",
        requestedTermDays: 30,
        monthlyRevenue: 18000,
        typicalDaysLatePastTerm: 3,
        buyerReturnOnCashAssumption: 0.04,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Professional services': contracted Net 30/Net 45, realized DSO 45–65 days.",
      },
    ],
  },
  {
    id: "harbor-point-distribution",
    name: "Harbor Point Distribution (synthetic)",
    archetype: "distributor",
    synthetic: true,
    monthlyPayrollDates: [1, 15],
    monthlyPayrollAmount: 30000,
    monthlyRent: 9000,
    monthlyVendorBills: 120000,
    vendorTermsDays: 30,
    cashBuffer: 90000,
    costOfCapital: 0.10,
    grossMarginPct: 0.14,
    openingAskDays: 15,
    buyers: [
      {
        id: "union-hardware-retail",
        name: "Union Hardware Retail (synthetic)",
        requestedTermDays: 60,
        monthlyRevenue: 150000,
        typicalDaysLatePastTerm: 4,
        buyerReturnOnCashAssumption: 0.04,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Wholesale & distribution': contracted Net 30/Net 60, realized DSO 30–50 days.",
      },
      {
        id: "coastal-builders-supply",
        name: "Coastal Builders Supply (synthetic)",
        requestedTermDays: 45,
        monthlyRevenue: 95000,
        typicalDaysLatePastTerm: 0,
        buyerReturnOnCashAssumption: 0.035,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Wholesale & distribution': contracted Net 30/Net 60, realized DSO 30–50 days.",
      },
      {
        id: "ridge-and-co-retailers",
        name: "Ridge & Co Retailers (synthetic)",
        requestedTermDays: 30,
        monthlyRevenue: 60000,
        typicalDaysLatePastTerm: 6,
        buyerReturnOnCashAssumption: 0.045,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Wholesale & distribution': contracted Net 30/Net 60, realized DSO 30–50 days.",
      },
    ],
  },
  {
    id: "ironclad-electrical-subcontracting",
    name: "Ironclad Electrical Subcontracting (synthetic)",
    archetype: "subcontractor",
    synthetic: true,
    monthlyPayrollDates: [1, 15],
    monthlyPayrollAmount: 51000,
    monthlyRent: 3800,
    monthlyVendorBills: 22000,
    vendorTermsDays: 30,
    cashBuffer: 35000,
    costOfCapital: 0.15,
    grossMarginPct: 0.18,
    openingAskDays: 30,
    buyers: [
      {
        id: "summit-general-contractors",
        name: "Summit General Contractors (synthetic)",
        requestedTermDays: 100,
        monthlyRevenue: 70000,
        typicalDaysLatePastTerm: 10,
        buyerReturnOnCashAssumption: 0.04,
        retainagePct: 0.08,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Construction / subcontracting': contracted Net 60+, realized DSO 90–120 days (progress billing + retainage).",
      },
      {
        id: "brightline-builders",
        name: "Brightline Builders (synthetic)",
        requestedTermDays: 75,
        monthlyRevenue: 30000,
        typicalDaysLatePastTerm: 0,
        buyerReturnOnCashAssumption: 0.035,
        retainagePct: 0.05,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Construction / subcontracting': contracted Net 60+, realized DSO 90–120 days (progress billing + retainage).",
      },
      {
        id: "delta-grade-construction",
        name: "Delta Grade Construction (synthetic)",
        requestedTermDays: 90,
        monthlyRevenue: 20000,
        typicalDaysLatePastTerm: 15,
        buyerReturnOnCashAssumption: 0.05,
        retainagePct: 0.10,
        sourceNote:
          "/research/payment-terms-research.html §01, row 'Construction / subcontracting': contracted Net 60+, realized DSO 90–120 days (progress billing + retainage).",
      },
    ],
  },
];

/** Sum of monthly revenue from every buyer of `supplier` EXCEPT `excludeBuyerId`. */
export function monthlyOtherInflow(supplier: SupplierProfile, excludeBuyerId: string): number {
  return supplier.buyers
    .filter((b) => b.id !== excludeBuyerId)
    .reduce((sum, b) => sum + b.monthlyRevenue, 0);
}

export function monthlyFixedOutflows(supplier: SupplierProfile): number {
  return supplier.monthlyPayrollAmount + supplier.monthlyRent + supplier.monthlyVendorBills;
}
