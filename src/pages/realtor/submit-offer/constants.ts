import { BadgeCheck, DollarSign, FileText } from "lucide-react";

export const OFFER_STEPS = [
  { id: 1, label: "Offer Details", icon: DollarSign },
  { id: 2, label: "Professional Setup", icon: BadgeCheck },
  { id: 3, label: "Review & Submit", icon: FileText },
] as const;

// ─── Step 1: Closing Timeline ─────────────────────────────────────────────────

export const TIMELINE_OPTIONS = [
  { value: 30 as const, label: "30 Days" },
  { value: 45 as const, label: "45 Days" },
  { value: 60 as const, label: "60 Days" },
];

// ─── Step 2: Commission Range (2% to 6%) ─────────────────────────────────────
// Realtor commission can be any value between 2% and 6% (decimals allowed, e.g. 3.75%).

export const COMMISSION_MIN = 2;
export const COMMISSION_MAX = 6;
export const COMMISSION_STEP = 0.25; // slider step size

// ─── Step 2: Agency Role ──────────────────────────────────────────────────────

export const AGENCY_ROLES = [
  "Listing Agent",
  "Transaction Coordinator",
] as const;

// ─── Step 2: Payment Source ───────────────────────────────────────────────────

export const PAYMENT_SOURCES = [
  "Seller Pays Commission",
  "Buyer Pays Commission",
] as const;
