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
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
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