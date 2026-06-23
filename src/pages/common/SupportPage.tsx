import type { ReactNode } from "react";
import {
  Building2,
  DollarSign,
  HelpCircle,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

interface FaqSection {
  title: string;
  icon: any;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "General & Account Setup",
    icon: HelpCircle,
    items: [
      {
        question: "What is TRACT?",
        answer:
          "TRACT is a real estate clearinghouse and PropTech platform designed to streamline property dispositions. It allows wholesalers and disposition managers to list off-market contracts and properties directly to a vetted pool of active buyers, tracking the transaction from upload to a successful close.",
      },
      {
        question: "How do I create an account?",
        answer:
          "You can sign up directly through the app by providing your business entity details, contact information, and verifying your identity. Once approved, you can immediately begin uploading properties.",
      },
    ],
  },
  {
    title: "Pricing & Fees",
    icon: DollarSign,
    items: [
      {
        question: "How much does it cost to list a property on TRACT?",
        answer:
          "Listing a property is completely free. There are zero upfront costs, monthly subscription fees, or hidden marketing charges. But after the first listing you would be charged $500 as a SAAS service fee but at the end of the closing of the deal only. So there is no upfront cost.",
      },
      {
        question: "When and how am I charged the platform fee?",
        answer:
          "TRACT operates on a strict success-based model. You are only charged a flat $500 SAAS fee at closing. If the deal does not close, you owe nothing. The fee is automatically collected through escrow/title at the time of dynamic settlement.",
      },
    ],
  },
  {
    title: "Property Management & Dispositions",
    icon: Building2,
    items: [
      {
        question: "What information do I need to provide to list a deal?",
        answer: (
          <>
            <p>To ensure a high-quality marketplace, listings require:</p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Property address and type</li>
              <li>Contract price, your locked price, and assignment fee/asking price</li>
              <li>Estimated ARV, After Repair Value, and rehab costs</li>
              <li>Photos, video walkthroughs, or inspection links</li>
              <li>Clear details on the equitable interest or contract terms</li>
            </ul>
          </>
        ),
      },
      {
        question: "Can I edit or remove a listing after it goes live?",
        answer:
          "Yes. You can update pricing, add recent inspection details, or pause a listing directly from your dashboard if you are negotiating outside the platform or need to renegotiate terms.",
      },
      {
        question: "How do I receive and review offers?",
        answer:
          "When a buyer submits an offer through App 2, you will receive a real-time push notification and email alert. You can view the buyer’s terms, proof of funds, and proposed closing timeline directly within your dashboard to accept, counter, or decline.",
      },
    ],
  },
  {
    title: "Shared Platform Mechanics & Security",
    icon: ShieldCheck,
    items: [
      {
        question:
          "How does TRACT protect equitable interest and prevent chain-linking?",
        answer:
          "TRACT actively vets listings to ensure the provider holds direct equitable interest, a valid, executable purchase and sale agreement, or direct ownership. Unauthorized re-marketing or daisy-chaining of deals without contract control is strictly prohibited.",
      },
      {
        question: "What happens if a party defaults on a transaction?",
        answer:
          "Standard legal real estate remedies apply as dictated by the executed assignment or purchase agreement. Earnest money deposits are held securely in a third-party escrow account and disbursed according to contract terms if a default occurs.",
      },
    ],
  },
];

function FaqSectionCard({ section }: { section: FaqSection }) {
  const Icon = section.icon;

  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-7 shadow-[var(--shadow-card)]">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--color-secondary)]">
            FAQ Section
          </p>

          <h2 className="mt-1 font-serif text-2xl font-black text-[var(--color-primary)]">
            {section.title}
          </h2>
        </div>
      </div>

      <div className="space-y-5">
        {section.items.map((item) => (
          <div
            key={item.question}
            className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5"
          >
            <h3 className="text-base font-black text-[var(--color-primary)]">
              {item.question}
            </h3>

            <div className="mt-3 text-sm leading-7 text-[var(--color-text-main)]">
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Help Center
            </p>

            <h1 className="mt-2 font-serif text-4xl font-black text-[var(--color-primary)]">
              Support & FAQs
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">
              Quick answers about TRACT account setup, pricing, listing
              management, offers, security, and transaction handling.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-secondary)]/20 text-[var(--color-primary)]">
            <LifeBuoy className="h-8 w-8" />
          </div>
        </div>
      </section>

      {FAQ_SECTIONS.map((section) => (
        <FaqSectionCard key={section.title} section={section} />
      ))}
    </div>
  );
}