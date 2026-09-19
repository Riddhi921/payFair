import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  computeScenario,
  type BuyerProfile,
  type Scenario,
  type SupplierProfile,
} from "@payfair/engine";
import { monthlyFixedOutflows, monthlyOtherInflow, suppliers } from "@payfair/engine/seed";
import type { ScenarioDef } from "./types.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCENARIOS_PATH = path.join(here, "..", "scenarios.json");

export function loadScenarioDefs(): ScenarioDef[] {
  const raw = readFileSync(SCENARIOS_PATH, "utf-8");
  return JSON.parse(raw) as ScenarioDef[];
}

export interface ResolvedScenario {
  def: ScenarioDef;
  supplier: SupplierProfile;
  buyer: BuyerProfile;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
  scenario: Scenario;
}

/** Applies a scenario's overrides on top of the real seed data and computes everything downstream. */
export function resolveScenario(def: ScenarioDef): ResolvedScenario {
  const baseSupplier = suppliers.find((s) => s.id === def.supplierId);
  if (!baseSupplier) throw new Error(`scenario ${def.id}: unknown supplierId ${def.supplierId}`);
  const baseBuyer = baseSupplier.buyers.find((b) => b.id === def.buyerId);
  if (!baseBuyer) throw new Error(`scenario ${def.id}: unknown buyerId ${def.buyerId}`);

  const buyer: BuyerProfile = { ...baseBuyer, ...def.overrides?.buyer };
  const supplier: SupplierProfile = {
    ...baseSupplier,
    ...def.overrides?.supplier,
    buyers: baseSupplier.buyers.map((b) => (b.id === buyer.id ? buyer : b)),
  };

  const buyerAskDays = buyer.requestedTermDays;
  const costOfCapital = supplier.costOfCapital;
  const buyerReturnOnCash = buyer.buyerReturnOnCashAssumption;

  const scenario = computeScenario({
    supplier,
    buyer,
    buyerAskDays,
    costOfCapital,
    buyerReturnOnCash,
    monthlyFixedOutflows: monthlyFixedOutflows(supplier),
    monthlyOtherInflow: monthlyOtherInflow(supplier, buyer.id),
  });

  return { def, supplier, buyer, buyerAskDays, costOfCapital, buyerReturnOnCash, scenario };
}
