import { DollarSign, FileCheck2, Send } from "lucide-react";

export const BID_STEPS = [
  { id: 1, label: "Bid Price", icon: DollarSign },
  { id: 2, label: "Terms", icon: FileCheck2 },
  { id: 3, label: "Confirm & Submit", icon: Send },
];


export const INSPECTION_PERIODS: (3 | 7 | 10)[] = [3, 7, 10];
export const DUE_DILIGENCE_PERIODS: (5 | 10 | 15)[] = [5, 10, 15];
