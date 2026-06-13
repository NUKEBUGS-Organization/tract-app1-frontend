import { DollarSign, FileCheck2, Send } from "lucide-react";

export const BID_STEPS = [
  { id: 1, label: "Bid Details", icon: DollarSign },
  { id: 2, label: "Due Diligence", icon: FileCheck2 },
  { id: 3, label: "Confirm & Submit", icon: Send },
];

export const CONTINGENCY_OPTIONS = [
  { value: "financing", label: "Financing Contingency" },
  { value: "inspection", label: "Inspection Contingency" },
  { value: "appraisal", label: "Appraisal Contingency" },
  { value: "none", label: "No Contingencies (Cash / Clean Offer)" },
];

export const CLOSE_TIMELINES = [
  "7 days",
  "14 days",
  "21 days",
  "30 days",
  "45 days",
  "60 days",
  "Flexible",
];

export const BUYER_TYPES = [
  { value: "cash", label: "Cash Buyer" },
  { value: "hard_money", label: "Hard Money" },
  { value: "conventional", label: "Conventional Financing" },
  { value: "private", label: "Private Money" },
];
