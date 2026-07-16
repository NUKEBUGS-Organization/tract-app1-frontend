export const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

export const WHOLESALER_SCORE_EVENTS = [
  {
    value: "ghosting",
    label: "Ghosting",
    description: "-10: Partner stops responding during an active deal.",
  },
  {
    value: "inspection_cancellation",
    label: "Inspection Cancellation",
    description: "-20: Partner cancels inspection after seller moved forward.",
  },
  {
    value: "missed_deadline",
    label: "Missed Deadline",
    description: "-15: Partner misses an important proof/milestone/deadline.",
  },
  {
    value: "failure_to_proceed_to_closing",
    label: "Failure to Proceed to Closing",
    description:
      "-20: Inspection period ends without confirming Proceed to Closing.",
  },
  {
    value: "marketing_proof_missed",
    label: "Marketing Proof Missed",
    description:
      "-15 configurable mapping: 72-hour marketing proof was not uploaded.",
  },
  {
    value: "manual_adjustment",
    label: "Manual Adjustment",
    description: "Admin-defined score change. Delta is required.",
  },
];

export const REALTOR_SCORE_EVENTS = [
  {
    value: "slow_response",
    label: "Slow Response",
    description: "-10: Realtor delays communication during an active deal.",
  },
  {
    value: "missed_milestone",
    label: "Missed Milestone",
    description:
      "-15: Realtor misses required launch/showing/appraisal/closing milestone.",
  },
  {
    value: "deal_fallout_negligence",
    label: "Deal Fallout due to Negligence",
    description:
      "-20: Deal falls through because realtor failed expected duties.",
  },
  {
    value: "market_launch_missed",
    label: "Market Launch Proof Missed",
    description:
      "-15 configurable mapping: 7-day market launch proof was not uploaded.",
  },
  {
    value: "manual_adjustment",
    label: "Manual Adjustment",
    description: "Admin-defined score change. Delta is required.",
  },
];