export interface BidFormState {

  bid_price: string; // sent as number to API

  inspection_period: 3 | 7 | 10 | null;     // InspectionPeriod enum
  due_diligence_period: 5 | 10 | 15 | null; // DueDiligencePeriod enum

  loi_url: string;
  proof_of_funds_url: string;
}

export const DEFAULT_BID_FORM: BidFormState = {
  bid_price: "",
  inspection_period: null,
  due_diligence_period: null,
  loi_url: "",
  proof_of_funds_url: "",
};
