export const CONTACT_RULE_WARNING =
  "Do not share phone numbers, emails, addresses, WhatsApp, social links, or external links.";

const COMMON_TLDS = [
  "com",
  "net",
  "org",
  "io",
  "co",
  "pk",
  "us",
  "uk",
  "ca",
  "edu",
  "gov",
  "info",
  "biz",
  "me",
  "app",
  "dev",
  "ai",
  "ly",
  "in",
  "au",
  "de",
  "fr",
  "ae",
  "sa",
  "qa",
  "om",
  "kw",
  "bh",
  "bd",
  "np",
  "lk",
  "cn",
  "jp",
  "kr",
  "ru",
  "br",
  "mx",
  "za",
  "xyz",
  "site",
  "online",
  "store",
  "shop",
  "live",
  "link",
  "click",
  "cloud",
  "tech",
  "digital",
  "agency",
  "today",
  "world",
  "space",
  "website",
].join("|");

const CITY_OR_LOCATION_WORDS = [
  "new york",
  "newyork",
  "ny",
  "california",
  "texas",
  "florida",
  "chicago",
  "houston",
  "dallas",
  "austin",
  "miami",
  "los angeles",
  "washington",
  "maryland",
  "virginia",
  "pakistan",
  "lahore",
  "karachi",
  "islamabad",
  "rawalpindi",
  "faisalabad",
  "multan",
  "peshawar",
  "dubai",
  "sharjah",
  "abu dhabi",
  "london",
  "toronto",
].join("|");

const digitMap: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

function convertToEnglishDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => digitMap[digit] || digit);
}

function normalizeMessage(value: string) {
  return convertToEnglishDigits(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function compactForDetection(value: string) {
  return value
    .replace(/\s*(?:\(|\[|\{)?\bat\b(?:\)|\]|\})?\s*/gi, "@")
    .replace(/\s*(?:\(|\[|\{)?\bdot\b(?:\)|\]|\})?\s*/gi, ".")
    .replace(/\s*(?:\(|\[|\{)?\bd0t\b(?:\)|\]|\})?\s*/gi, ".")
    .replace(/\s*(?:\(|\[|\{)?\bpoint\b(?:\)|\]|\})?\s*/gi, ".")
    .replace(/[،,]/g, ".")
    .replace(/\s+/g, "");
}

export function detectContactViolation(message: string) {
  const raw = normalizeMessage(message);

  if (!raw) return "";

  const compact = compactForDetection(raw);

  const contactIntentRegex =
    /\b(call\s*me|text\s*me|message\s*me|whats\s*app\s*me|whatsapp\s*me|email\s*me|mail\s*me|dm\s*me|contact\s*me|reach\s*me|ping\s*me|send\s*me\s*(your\s*)?(number|email|location|address)|my\s*(phone|mobile|cell|contact|number|email|mail|address|location)|phone\s*number|mobile\s*number|cell\s*number|outside\s*(the\s*)?chat|off\s*platform|directly\s*contact|direct\s*contact)\b/i;

  if (contactIntentRegex.test(raw)) {
    return "Contact sharing is not allowed. Please keep all communication inside this chat.";
  }

  const emailRegex =
    /[a-z0-9._%+-]{2,}@[a-z0-9-]{2,}(?:\.[a-z0-9-]{2,})*\.[a-z]{2,24}/i;

  if (emailRegex.test(compact)) {
    return "Email sharing is not allowed in chat.";
  }

  const emailProviderIntentRegex =
    /\b(gmail|yahoo|hotmail|outlook|icloud|protonmail|aol|zoho)\b/i;

  if (
    emailProviderIntentRegex.test(raw) ||
    emailProviderIntentRegex.test(compact)
  ) {
    return "Email sharing is not allowed in chat.";
  }

  const urlRegex = new RegExp(
    `(?:https?:\\/\\/|www\\.|[a-z0-9-]{2,}\\.(?:${COMMON_TLDS})(?:\\b|\\/|\\?|#|:))`,
    "i"
  );

  if (urlRegex.test(compact)) {
    return "External links are not allowed in chat.";
  }

  const socialContactRegex =
    /\b(wa\.me|whatsapp|telegram|t\.me|signal|instagram|insta|facebook|fb\.com|messenger|linkedin|snapchat|discord|twitter|x\.com|skype|viber|imo)\b/i;

  if (socialContactRegex.test(raw) || socialContactRegex.test(compact)) {
    return "External contact apps or social links are not allowed in chat.";
  }

  const addressIntentRegex =
    /\b(my\s*address|home\s*address|office\s*address|address\s*is|location\s*is|located\s*at|visit\s*me|come\s*to|meet\s*me\s*at|send\s*location|share\s*location|pin\s*location|near\s*my\s*house|my\s*house|my\s*home|my\s*office)\b/i;

  if (addressIntentRegex.test(raw)) {
    return "Address or location sharing is not allowed in chat.";
  }

  const formalStreetAddressRegex =
    /\b\d{1,6}\s+[a-z0-9'.#-]+(?:\s+[a-z0-9'.#-]+){0,8}\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|boulevard|blvd|circle|cir|way|place|pl|terrace|ter|highway|hwy|parkway|pkwy|suite|ste|apt|apartment|unit|block|sector|phase|colony|town|society|building|floor|house|flat|plot)\b/i;

  if (formalStreetAddressRegex.test(raw)) {
    return "Address sharing is not allowed in chat.";
  }

  const shortStreetRegex =
    /\b\d{1,6}\s*(st|street|rd|road|ave|avenue|dr|drive|ln|lane|ct|court|blvd|boulevard|hwy|highway|way|pl|place)\b/i;

  if (shortStreetRegex.test(raw)) {
    return "Address sharing is not allowed in chat.";
  }

  const ordinalStreetRegex =
    /\b\d{1,6}\s*(st|nd|rd|th)\s*(street|road|avenue|ave|lane|drive|dr|court|ct|way|place|pl)?\b/i;

  if (ordinalStreetRegex.test(raw)) {
    return "Address sharing is not allowed in chat.";
  }

  const areaUnitRegex =
    /\b((phase|block|sector|plot|house|flat|unit|apt|apartment|suite|floor)\s*[#:-]?\s*[a-z0-9-]{1,10}|[a-z0-9-]{1,10}\s*(phase|block|sector|plot|house|flat|unit|apt|apartment|suite|floor))\b/i;

  if (areaUnitRegex.test(raw)) {
    return "Address sharing is not allowed in chat.";
  }

  const roadNameRegex =
    /\b[a-z][a-z0-9'.-]{1,30}\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|boulevard|blvd|circle|cir|way|place|pl|terrace|ter|highway|hwy|parkway|pkwy)\b/i;

  if (roadNameRegex.test(raw)) {
    return "Address sharing is not allowed in chat.";
  }

  const numericLocationRegex = new RegExp(
    `\\b\\d{1,6}\\s*[a-z]{0,15}\\s*[,،]\\s*(${CITY_OR_LOCATION_WORDS})\\b`,
    "i"
  );

  if (numericLocationRegex.test(raw)) {
    return "Address sharing is not allowed in chat.";
  }

  const cityLocationRegex = new RegExp(`\\b(${CITY_OR_LOCATION_WORDS})\\b`, "i");

  if (cityLocationRegex.test(raw)) {
    return "Location sharing is not allowed in chat.";
  }

  const numberWordsRegex =
    /(?:\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|oh|o)\b[\s,.-]*){5,}/i;

  if (numberWordsRegex.test(raw)) {
    return "Phone numbers or numeric contact details are not allowed in chat.";
  }

  // Allows 1-6 digits, blocks 7+ digits.
  const sevenOrMoreDigitsRegex = /(?:\d[\s().+\-]*){7,}/;

  if (sevenOrMoreDigitsRegex.test(raw)) {
    return "Phone numbers or numeric contact details are not allowed in chat.";
  }

  return "";
}

export function hasContactViolation(message: string) {
  return Boolean(detectContactViolation(message));
}