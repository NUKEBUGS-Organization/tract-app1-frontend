export interface OfferFormState {
  /** Proposed sale price entered by the realtor — stored as string for easy input binding */
  offer_price: string;

  /** Closing timeline in days: 30, 45, or 60 */
  closing_timeline_days: 30 | 45 | 60;

  /** Commission percentage the realtor will charge: 2 through 6 (supports decimals like 2.5) */
  commission_pct: number;

  /** How the realtor represents the seller */
  agency_role: string;

  /** Who pays the commission at closing */
  payment_source: string;
}

/** The default initial values when the form first loads */
export const DEFAULT_OFFER_FORM: OfferFormState = {
  offer_price: "",
  closing_timeline_days: 45,
  commission_pct: 3,
  agency_role: "Listing Agent",
  payment_source: "Seller Pays Commission",
};
