export const SELLER_TOUR_VERSION = 1;

export type TourSide = "top" | "right" | "bottom" | "left";
export type TourAlign = "start" | "center" | "end";

export interface SellerTourStep {
  route: string;
  element?: string;
  title: string;
  description: string;
  side?: TourSide;
  align?: TourAlign;
}

export const sellerTourSteps: SellerTourStep[] = [
  // ---------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------
  {
    route: "/dashboard",
    title: "Welcome to TRACT 👋",
    description:
      "TRACT helps you list your property, manage documents, review offers, create contracts, and follow your transaction through closing. Let's take a quick tour of your Seller Portal.",
  },

  {
    route: "/dashboard",
    element: '[data-tour="seller-dashboard"]',
    title: "Your Seller Dashboard",
    description:
      "This is your home base. Get a quick overview of your listings, bids received, properties under contract, and total market value.",
    side: "bottom",
    align: "start",
  },

  {
    route: "/dashboard",
    element: '[data-tour="nav-list-property"]',
    title: "Start by Listing a Property",
    description:
      "Create your property listing here. You'll enter the property location, type, key details, condition information, and seller details.",
    side: "right",
    align: "start",
  },

  // ---------------------------------------------------------
  // LIST PROPERTY
  // ---------------------------------------------------------
  {
    route: "/list-property",
    element: '[data-tour="listing-wizard"]',
    title: "Build Your Property Listing",
    description:
      "Complete the guided listing steps: Property Type, Hard Data, Condition, and Motivation. You don't need to complete a listing during this tour.",
    side: "bottom",
    align: "start",
  },

  // ---------------------------------------------------------
  // MY LISTINGS
  // ---------------------------------------------------------
  {
    route: "/my-listings",
    element: '[data-tour="my-listings-page"]',
    title: "Manage Your Listings",
    description:
      "Your listings are managed here. Track drafts, submitted listings, live properties, withdrawn listings, and properties progressing through the transaction.",
    side: "top",
    align: "start",
  },

  // ---------------------------------------------------------
  // DOCUMENT VAULT
  // ---------------------------------------------------------
  {
    route: "/document-vault",
    element: '[data-tour="document-vault-page"]',
    title: "Upload Property Documents",
    description:
      "After creating a property, use the Document Vault to upload the required survey and tax bill, along with property pictures. Required documents must be added before the listing can be submitted.",
    side: "top",
    align: "start",
  },

  // ---------------------------------------------------------
  // BIDS
  // ---------------------------------------------------------
  {
    route: "/bids",
    element: '[data-tour="view-bids-page"]',
    title: "Review Incoming Bids",
    description:
      "When Realtors or Wholesalers submit offers on your property, you'll review them here. Select the listing you want to inspect and compare its incoming bids.",
    side: "top",
    align: "start",
  },

  {
    route: "/bids",
    element: '[data-tour="listing-bids-section"]',
    title: "Choose a Primary Bid",
    description:
      "Compare bidder details, price, net-to-seller value, reliability, and terms. Select the offer you want to move forward with as the Primary Bid. You can also choose backups or reject offers.",
    side: "top",
    align: "start",
  },

  // ---------------------------------------------------------
  // CONTRACTS
  // ---------------------------------------------------------
  {
    route: "/contracts",
    element: '[data-tour="contract-setup"]',
    title: "Create the Contract",
    description:
      "After choosing a Primary Bid, the transaction moves into the contract stage. Select the listing and create or open its contract here.",
    side: "right",
    align: "start",
  },

  {
    route: "/contracts",
    element: '[data-tour="contract-signatures"]',
    title: "Track Contract Signatures",
    description:
      "Track both signatures here. You sign as the Seller, and the selected Realtor or Wholesaler completes the buyer-side signature. Once both parties sign, the deal can progress.",
    side: "left",
    align: "start",
  },

  // ---------------------------------------------------------
  // DEAL TRACKER
  // ---------------------------------------------------------
  {
    route: "/deals",
    element: '[data-tour="deal-tracker-page"]',
    title: "Track Your Deal",
    description:
      "Once the contract progresses, use the Deal Tracker to monitor the selected partner, signatures, important deadlines, marketing activity, and progress toward closing.",
    side: "top",
    align: "start",
  },

  // ---------------------------------------------------------
  // CHAT
  // ---------------------------------------------------------
  {
    route: "/chat",
    element: '[data-tour="chat-page"]',
    title: "Communicate With Your Deal Partner",
    description:
      "After a deal is created from a fully signed contract, a chat room becomes available so you can communicate with the selected Realtor or Wholesaler.",
    side: "top",
    align: "start",
  },

  // ---------------------------------------------------------
  // COMPLETE
  // ---------------------------------------------------------
  {
    route: "/chat",
    title: "You're Ready to Use TRACT 🎉",
    description:
      "You now know the Seller journey: create a listing, upload documents, receive and review bids, select a Primary Bid, manage the contract, track the deal, and communicate with your deal partner.",
  },
];