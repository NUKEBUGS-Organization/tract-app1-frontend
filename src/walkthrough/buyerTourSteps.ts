export const BUYER_TOUR_VERSION = 1;

export type BuyerTourRole =
  | "partner"
  | "realtor";

export type TourSide =
  | "top"
  | "right"
  | "bottom"
  | "left";

export type TourAlign =
  | "start"
  | "center"
  | "end";

export interface BuyerTourStep {
  route: string;
  element?: string;

  title: string;
  description: string;

  side?: TourSide;
  align?: TourAlign;
}

/* =========================================================
   WHOLESALER / PARTNER WALKTHROUGH
========================================================= */

export const partnerTourSteps: BuyerTourStep[] = [
  {
    route: "/dashboard",

    title: "Welcome to TRACT 👋",

    description:
      "TRACT helps you discover live off-market properties, submit bids, track seller decisions, manage contracts, follow active deals, and communicate with sellers.",
  },

  {
    route: "/dashboard",

    element:
      '[data-tour="partner-dashboard"]',

    title: "Your Partner Dashboard",

    description:
      "This is your Partner Pro workspace. Monitor available opportunities, pending bids, active deals, your reliability score, and your overall activity.",

    side: "bottom",
    align: "start",
  },

  {
    route: "/dashboard",

    element:
      '[data-tour="partner-reliability"]',

    title: "Reliability Score",

    description:
      "Your Reliability Score reflects your performance on TRACT. Missed deadlines, cancellations, and transaction issues may reduce your score and affect access to future deals.",

    side: "right",
    align: "start",
  },

  {
    route: "/dashboard",

    element:
      '[data-tour="nav-marketplace"]',

    title: "Browse Properties",

    description:
      "Use the Property Marketplace to discover live off-market opportunities available for bidding.",

    side: "right",
    align: "start",
  },

  {
    route: "/properties",

    element:
      '[data-tour="property-marketplace"]',

    title: "Live Property Stream",

    description:
      "Browse available properties here. Review the asking price, property type, condition, offer capacity and other important information before deciding whether to pursue an opportunity.",

    side: "bottom",
    align: "start",
  },

  {
    route: "/properties",

    title: "Review Property Details",

    description:
      "Use View Details on a property to review its photos, financial information, disclosures, condition report, seller documents and other available information.",
  },

  {
    route: "/properties",

    title: "Submit Your Bid",

    description:
      "When you find a property you want to pursue, choose Submit Bid. You'll provide your bid price, inspection period, due diligence period and any supporting information required by the transaction.",
  },

  {
    route: "/my-bids",

    element:
      '[data-tour="partner-my-bids"]',

    title: "Track Your Bids",

    description:
      "Every bid you submit is tracked here. Monitor pending bids, backup positions, rejected bids and offers selected by sellers.",

    side: "bottom",
    align: "start",
  },

  {
    route: "/my-bids",

    title: "When Your Bid Is Selected",

    description:
      "If the seller selects you as the Primary Bid, the transaction moves into the contract stage and the full property address becomes available.",
  },

  {
    route: "/my-contracts",

    element:
      '[data-tour="partner-contracts-page"]',

    title: "Manage Your Contracts",

    description:
      "Selected bids appear in My Contracts. Track contract creation, seller signature, your signature, active contracts and completed or cancelled transactions.",

    side: "top",
    align: "start",
  },

  {
    route: "/my-contracts",

    title: "Contract Signing",

    description:
      "The seller signs first. When your signature is required, open the transaction and complete your signature before the deal can become active.",
  },

  {
    route: "/deals",

    element:
      '[data-tour="partner-deals-page"]',

    title: "Track the Complete Deal",

    description:
      "The Deal Tracker follows the transaction from accepted bid and contract signatures through marketing proof, due diligence, inspection, closing preparation, title and escrow, and final closing.",

    side: "top",
    align: "start",
  },

  {
    route: "/deals",

    title: "Watch Your Deadlines",

    description:
      "Important transaction deadlines are managed here. Complete required actions such as marketing proof, due diligence and inspection within the displayed time windows.",
  },

  {
    route: "/chat",

    element:
      '[data-tour="chat-page"]',

    title: "Communicate With the Seller",

    description:
      "Once the transaction reaches the required stage, TRACT creates a deal chat so you can communicate directly with the seller during the transaction.",

    side: "top",
    align: "start",
  },

  {
    route: "/chat",

    title: "Remember Your Contract",

    description:
      "For transactions where your own contract is required, make sure your contract is prepared and provided through the required contract workflow before progressing with the deal.",
  },

  {
    route: "/chat",

    title: "You're Ready to Use TRACT 🎉",

    description:
      "You now know the Wholesaler journey: browse properties, review opportunities, submit bids, track seller decisions, manage contracts, follow active deals, meet transaction deadlines and communicate through TRACT.",
  },
];

/* =========================================================
   REALTOR WALKTHROUGH
========================================================= */

export const realtorTourSteps: BuyerTourStep[] = [
  {
    route: "/dashboard",

    title: "Welcome to TRACT 👋",

    description:
      "TRACT helps licensed partners discover seller opportunities, submit representation offers, manage listing agreements, track transactions and communicate with sellers.",
  },

  {
    route: "/dashboard",

    element:
      '[data-tour="realtor-dashboard"]',

    title: "Your Licensed Partner Dashboard",

    description:
      "This is your professional workspace. Monitor seller opportunities, submitted offers, active transactions and your Professional Score.",

    side: "bottom",
    align: "start",
  },

  {
    route: "/dashboard",

    element:
      '[data-tour="realtor-professional-score"]',

    title: "Professional Score",

    description:
      "Your Professional Score reflects your transaction performance on TRACT. Missed deadlines and transaction issues may reduce your score and affect future access.",

    side: "right",
    align: "start",
  },

  {
    route: "/dashboard",

    element:
      '[data-tour="nav-marketplace"]',

    title: "Browse Seller Opportunities",

    description:
      "Open the Marketplace to browse live seller opportunities available to licensed partners.",

    side: "right",
    align: "start",
  },

  {
    route: "/properties",

    element:
      '[data-tour="property-marketplace"]',

    title: "Seller Opportunity Stream",

    description:
      "Review available properties, asking prices, property condition, offer capacity and other information before deciding whether to represent a seller.",

    side: "bottom",
    align: "start",
  },

  {
    route: "/properties",

    title: "Review Property Details",

    description:
      "Use View Details to review property photos, financial information, disclosures, condition information, seller documents and other available information.",
  },

  {
    route: "/properties",

    title: "Submit a Representation Offer",

    description:
      "When you're ready to represent a seller, choose Submit Offer. Enter the proposed sale price, closing timeline, commission percentage, agency role and commission payment source.",
  },

  {
    route: "/my-bids",

    element:
      '[data-tour="realtor-my-offers"]',

    title: "Track Your Offers",

    description:
      "All of your representation offers are managed here. Monitor active offers, backup positions, rejected offers and offers selected by sellers.",

    side: "bottom",
    align: "start",
  },

  {
    route: "/my-bids",

    title: "When Your Offer Is Selected",

    description:
      "When the seller chooses your representation offer, the transaction moves into the listing agreement and contract workflow.",
  },

  {
    route: "/contracts",

    element:
      '[data-tour="realtor-contracts-page"]',

    title: "Manage Listing Agreements",

    description:
      "Track accepted representation offers, listing agreement creation, seller signatures, your signature, active listings and completed or cancelled agreements.",

    side: "top",
    align: "start",
  },

  {
    route: "/contracts",

    title: "Complete Your Agreement",

    description:
      "The seller signs the listing agreement first. When your signature is required, complete your signature to officially secure the listing.",
  },

  {
    route: "/deals",

    element:
      '[data-tour="realtor-deals-page"]',

    title: "Track the Transaction",

    description:
      "The Deal Tracker follows the listing from accepted representation offer through signatures, marketing launch, buyer engagement, negotiations and closing.",

    side: "top",
    align: "start",
  },

  {
    route: "/deals",

    title: "7-Day Marketing Rule",

    description:
      "Once the listing agreement is fully signed, launch the property to market and upload the required marketing proof within the displayed 7-day window.",
  },

  {
    route: "/chat",

    element:
      '[data-tour="chat-page"]',

    title: "Communicate With the Seller",

    description:
      "Use TRACT Chat when the transaction becomes active to communicate with the seller and coordinate the listing and transaction.",

    side: "top",
    align: "start",
  },

  {
    route: "/chat",

    title: "Remember Your Contract",

    description:
      "For transactions where you need to use your own professional contract or agreement, make sure it is prepared and provided through the required contract workflow.",
  },

  {
    route: "/chat",

    title: "You're Ready to Use TRACT 🎉",

    description:
      "You now know the Realtor journey: browse seller opportunities, review properties, submit representation offers, track selections, manage listing agreements, meet marketing deadlines, follow deals to closing and communicate through TRACT.",
  },
];

/* =========================================================
   ROLE HELPER
========================================================= */

export function getBuyerTourSteps(
  role: BuyerTourRole
) {
  if (role === "realtor") {
    return realtorTourSteps;
  }

  return partnerTourSteps;
}