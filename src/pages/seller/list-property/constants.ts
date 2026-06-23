import {
  AlertTriangle,
  FileText,
  Home,
  Layers,
  Send,
  Trees,
} from "lucide-react";

export const MIN_IMAGES = 1;
export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const PROPERTY_TYPES = [
  {
    id: "sfh",
    label: "Single Family Home",
    icon: Home,
    desc: "Standalone residential property",
  },
  {
    id: "multi_family",
    label: "Multi-Family",
    icon: Layers,
    desc: "Duplex, triplex, or apartment",
  },
  {
    id: "land",
    label: "Land",
    icon: Trees,
    desc: "Vacant or raw land",
  },
];

export const STATES = [
  { code: "NY", name: "New York" },
  { code: "NJ", name: "New Jersey" },
];

export const CONDITIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export const TIMELINES = ["30 days", "1-3 months", "3-6 months", "Flexible"];

export const SELL_REASONS = [
  "Need to relocate",
  "Financial hardship",
  "Estate / Inheritance",
  "Upgrading",
  "Investment exit",
  "Divorce",
  "Other",
];

export const STEPS = [
  { id: 1, label: "Property Type", icon: Home },
  { id: 2, label: "Hard Data", icon: FileText },
  { id: 3, label: "Condition", icon: AlertTriangle },
  { id: 4, label: "Motivation", icon: Send },
];

export function getPropertyTypeLabel(value?: string) {
  if (!value) return "-";

  const propertyType = PROPERTY_TYPES.find(
    (type) => type.id === value
  );

  return propertyType?.label || value;
}