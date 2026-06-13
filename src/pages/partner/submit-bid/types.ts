export interface BidFormState {
  // Step 1 – Bid Details
  offerAmount: string;
  earnestMoney: string;
  buyerType: string;
  contingencies: string[];

  // Step 2 – Due Diligence
  inspectionPeriodDays: string;
  closingTimeline: string;
  proofOfFundsNote: string;
  additionalNotes: string;
}

export const DEFAULT_BID_FORM: BidFormState = {
  offerAmount: "",
  earnestMoney: "",
  buyerType: "",
  contingencies: [],
  inspectionPeriodDays: "",
  closingTimeline: "",
  proofOfFundsNote: "",
  additionalNotes: "",
};
