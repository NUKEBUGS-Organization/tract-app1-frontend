import type { FormState } from "./types";

export function buildListingPayload(form: FormState) {
  const payload: any = {
    property_type: form.propertyType,
    address: form.address.trim(),
    zip_code: form.zip.trim(),
    state_code: form.state,
    year_built: Number(form.yearBuilt),
    zoning: form.zoning.trim(),
    market_price: Number(form.marketPrice),
    has_liens: form.hasLiens,
    is_preforeclosure: form.isPreforeclosure,
    is_vacant: form.isVacant,
    is_off_market: form.isOffMarket,
    condition_report: {
      roof: form.roofCondition,
      hvac: form.hvacCondition,
      wetlands: form.hasWetlands,
      overall: form.overallCondition,
      notes: form.conditionNotes.trim(),
    },
    motivation: form.reason,
    sell_timeline: form.timeline,
    proof_of_funds_required: form.proofOfFundsRequired,
  };

  if (form.hiddenReserve) {
    payload.hidden_reserve = Number(form.hiddenReserve);
  }

  if (form.hasLiens && form.lienDetails.trim()) {
    payload.lien_disclosure = form.lienDetails.trim();
  }

  if (form.mortgageAmount) {
    payload.mortgage_amount = Number(form.mortgageAmount);
  }

  if (form.realtorCommission) {
    payload.realtor_commission = Number(form.realtorCommission);
  }

  if (form.propertyType === "multi_family" && form.unitCount) {
    payload.unit_count = Number(form.unitCount);
  }

  return payload;
}