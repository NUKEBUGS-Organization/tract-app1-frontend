import type { FormState } from "./schema";

export type { FormState };

export const DEFAULT_FORM: FormState = {
  propertyType: "",
  unitCount: "",

  address: "",
  state: "",
  zip: "",

  zoning: "",
  yearBuilt: "",
  marketPrice: "",
  hiddenReserve: "",

  hasLiens: false,
  lienDetails: "",
  isPreforeclosure: false,
  mortgageAmount: "",

  roofCondition: "",
  hvacCondition: "",
  overallCondition: "",
  conditionNotes: "",
  hasWetlands: false,
  isVacant: false,
  isOffMarket: false,

  timeline: "",
  reason: "",
  realtorCommission: "",
  proofOfFundsRequired: true,
};