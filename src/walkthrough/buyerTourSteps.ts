export const BUYER_TOUR_VERSION = 2;

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

export function getPartnerTourSteps(
  hasProperties: boolean = true
): BuyerTourStep[] {
  const steps: BuyerTourStep[] = [
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
        "Browse available properties here. Review the asking price, property type, condition, offer capacity, and other important metrics before deciding whether to pursue an opportunity.",

      side: "bottom",
      align: "start",
    },
  ];

  /*
   * If properties are currently listed on the marketplace,
   * guide through the card's View Details and Submit Bid buttons,
   * plus the key steps of submitting a bid.
   */
  if (hasProperties) {
    steps.push(
      {
        route: "/properties",

        element:
          '[data-tour="property-card-view-details"]',

        title: "View Property Details",

        description:
          "Click View Details on any property to inspect high-resolution photos, financial metrics, condition reports, seller disclosures, and uploaded documents before making an offer.",

        side: "top",
        align: "start",
      },

      {
        route: "/properties",

        element:
          '[data-tour="property-card-bid"]',

        title: "Submit Your Bid",

        description:
          "Ready to pursue a deal? Click Submit Bid to initiate your offer directly with the seller. Make sure to submit your bid before the offer capacity fills.",

        side: "top",
        align: "end",
      },

      {
        route: "/properties",

        element:
          '[data-tour="property-card-bid-cap"]',

        title: "Track Bid Capacity",

        description:
          "Every property has a maximum offer cap. Monitor the current bid count and remaining spots so you submit before the cap fills and bidding closes.",

        side: "top",
        align: "start",
      },

      {
        route: "/properties",

        title: "Bidding Step 1: Offer Terms & Price",

        description:
          "In the first step of bidding, specify your purchase price, earnest money deposit, inspection window (in days), and due diligence period for the transaction.",
      },

      {
        route: "/properties",

        title: "Bidding Step 2: Proof & Documents",

        description:
          "Attach your Proof of Funds (POF) or Letter of Intent (LOI) to verify your purchasing power and give the seller confidence in your offer.",
      },

      {
        route: "/properties",

        title: "Bidding Step 3: Review & Submission",

        description:
          "Review all terms before final submission. Once sent, the seller evaluates competing bids and selects the Primary Bid to advance into contract.",
      }
    );
  } else {
    steps.push(
      {
        route: "/properties",

        title: "Review Property Details",

        description:
          "When live properties are listed here, click View Details to review photos, financial data, condition reports, seller disclosures, and uploaded documents.",
      },

      {
        route: "/properties",

        title: "Bidding on Properties",

        description:
          "Click Submit Bid on any listed opportunity to enter your offer price, inspection period, due diligence window, and proof of funds.",
      }
    );
  }

  steps.push(
    {
      route: "/proof-of-activity",

      element:
        '[data-tour="proof-of-activity-page"]',

      title: "Proof of Activity Required",

      description:
        "Before you can bid on live properties, TRACT requires you to verify your wholesaling activity. You'll need to upload a recent contract to gain full platform access.",

      side: "bottom",
      align: "start",
    },

    {
      route: "/proof-of-activity",

      element:
        '[data-tour="proof-of-activity-page"]',

      title: "Upload Your Contract",

      description:
        "Upload a past contract showing your legal name, dated within the last 3–6 months. This confirms you are an active wholesaler. Once approved by our admin team, you will have full access to submit bids.",

      side: "bottom",
      align: "start",
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

    // {
    //   route: "/chat",

    //   title: "Remember Your Contract",

    //   description:
    //     "For transactions where your own contract is required, make sure your contract is prepared and provided through the required contract workflow before progressing with the deal.",
    // },

    {
      route: "/chat",

      title: "You're Ready to Use TRACT 🎉",

      description:
        "You now know the Wholesaler journey: browse properties, review opportunities, submit bids, track seller decisions, manage contracts, follow active deals, meet transaction deadlines and communicate through TRACT.",
    }
  );

  return steps;
}

export const partnerTourSteps: BuyerTourStep[] =
  getPartnerTourSteps(true);

/* =========================================================
   REALTOR WALKTHROUGH
========================================================= */

export function getRealtorTourSteps(
  hasProperties: boolean = true
): BuyerTourStep[] {
  const steps: BuyerTourStep[] = [
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
  ];

  /*
   * If properties are currently listed on the marketplace,
   * guide through the card's View Details and Submit Offer buttons,
   * plus the key steps of submitting a representation offer.
   */
  if (hasProperties) {
    steps.push(
      {
        route: "/properties",

        element:
          '[data-tour="property-card-view-details"]',

        title: "View Property Details",

        description:
          "Click View Details on any seller opportunity to review photos, financial information, disclosures, property condition, and seller documentation.",

        side: "top",
        align: "start",
      },

      {
        route: "/properties",

        element:
          '[data-tour="property-card-offer"]',

        title: "Submit Representation Offer",

        description:
          "When you are ready to represent a seller, click Submit Offer to launch the representation proposal wizard.",

        side: "top",
        align: "end",
      },

      {
        route: "/properties",

        element:
          '[data-tour="property-card-bid-cap"]',

        title: "Offer Capacity & Opportunities",

        description:
          "Track incoming representation proposals. Submit your offer before the seller's capacity fills or the opportunity closes.",

        side: "top",
        align: "start",
      },

      {
        route: "/properties",

        title: "Offer Step 1: Proposed Terms",

        description:
          "Propose the listing sale price, target closing timeline, and marketing strategy for the seller's property.",
      },

      {
        route: "/properties",

        title: "Offer Step 2: Commission & Agency Role",

        description:
          "Specify your commission percentage, agency representation type (exclusive or non-exclusive), and payment terms.",
      },

      {
        route: "/properties",

        title: "Offer Step 3: Review & Submission",

        description:
          "Review your proposal before submitting directly to the seller. When chosen, the deal advances to listing agreements under My Offers.",
      }
    );
  } else {
    steps.push(
      {
        route: "/properties",

        title: "Review Property Details",

        description:
          "When seller opportunities are listed here, click View Details to review photos, financials, disclosures, and documents.",
      },

      {
        route: "/properties",

        title: "Submit Representation Offers",

        description:
          "Use Submit Offer to propose your listing terms, closing timeline, commission percentage, and agency representation role.",
      }
    );
  }

  steps.push(
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
    }
  );

  return steps;
}

export const realtorTourSteps: BuyerTourStep[] =
  getRealtorTourSteps(true);

/* =========================================================
   ROLE HELPER
========================================================= */

export function getBuyerTourSteps(
  role: BuyerTourRole,
  hasProperties: boolean = true
) {
  if (role === "realtor") {
    return getRealtorTourSteps(hasProperties);
  }

  return getPartnerTourSteps(hasProperties);
}