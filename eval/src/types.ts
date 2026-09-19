export interface ScenarioOverrides {
  supplier?: Partial<{
    cashBuffer: number;
    costOfCapital: number;
    grossMarginPct: number;
    openingAskDays: number;
  }>;
  buyer?: Partial<{
    requestedTermDays: number;
    monthlyRevenue: number;
    buyerReturnOnCashAssumption: number;
    typicalDaysLatePastTerm: number;
  }>;
}

export interface ScenarioDef {
  id: string;
  archetype: string;
  supplierId: string;
  buyerId: string;
  description: string;
  overrides?: ScenarioOverrides;
}

export interface CheckResult {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

export interface ImportedMessage {
  scenarioId: string;
  message: string;
}
