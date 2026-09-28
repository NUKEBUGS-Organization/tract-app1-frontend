import type { ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, ArrowLeft, ShieldCheck, Lock } from "lucide-react";

import tractLogo from "../../assets/tract-logo.png";

interface TermSection {
    number: string;
    title: string;
    body: ReactNode;
}

const SECTIONS: TermSection[] = [
    {
        number: "1",
        title: "60-Day Beta Period & System Updates",
        body: (
            <>
                <p>
                    You acknowledge that the Platform is entering a 60-day
                    introductory launch phase ("Beta Period").
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Frequent Updates:
                        </span>{" "}
                        During this 60-day window, the Platform will undergo continuous
                        development, maintenance, and frequent software updates. You may
                        experience temporary interruptions or changes in user interface
                        as we optimize the system.
                    </li>
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Financial Model Deferment:
                        </span>{" "}
                        Any updates to the long-term transactional fee structure (the
                        "Standard Financial Model") deployed to the software during this
                        period will not be enforced on your account until the conclusion
                        of the 60-day Beta Period.
                    </li>
                </ul>
            </>
        ),
    },
    {
        number: "2",
        title: "Beta Period Platform Use Fees",
        body: (
            <>
                <p>
                    To utilize the digital clearinghouse and contract generation tools
                    during the Beta Period, Users are subject to mandatory,
                    non-refundable Software as a Service (SaaS) Technology Fees:
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Wholesaler / Asset Provider Tier:
                        </span>{" "}
                        $50.00 per month.
                    </li>
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Buyer / Investor Tier:
                        </span>{" "}
                        $100.00 per month.
                    </li>
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Payment Trigger:
                        </span>{" "}
                        These Platform Use Fees must be paid in full prior to the
                        execution of your first contract or digital assignment on the
                        Platform. All fees are strictly non-refundable, regardless of
                        whether a real estate transaction successfully reaches
                        settlement.
                    </li>
                </ul>
            </>
        ),
    },
    {
        number: "3",
        title: "Mandatory On-Platform Execution & Reporting",
        body: (
            <>
                <p>
                    TRACT Inc. provides the technological infrastructure to route,
                    track, and close off-market real estate transactions.
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Exclusive Deal Execution:
                        </span>{" "}
                        Any transaction initiated, discovered, or negotiated through the
                        Platform must be closed utilizing the Platform's digital
                        workflows.
                    </li>
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Action Tracking:
                        </span>{" "}
                        Both Buyers and Wholesalers are legally required to report all
                        material updates, status changes, and executed documents
                        regarding a deal directly within the app. Failure to log
                        transaction milestones constitutes a material breach of this
                        Agreement.
                    </li>
                </ul>
            </>
        ),
    },
    {
        number: "4",
        title: "Non-Circumvention & Legal Penalties",
        body: (
            <>
                <p>
                    Users are strictly prohibited from attempting to bypass, dodge, or
                    circumvent the Platform to avoid SaaS Technology Fees or platform
                    tracking after connecting with another party through TRACT or Buy
                    TRACT.
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Platform Tracking:
                        </span>{" "}
                        TRACT utilizes communication monitoring and response-tracking
                        metrics to ensure compliance.
                    </li>
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Penalties for Circumvention:
                        </span>{" "}
                        If TRACT Inc. determines that you have taken a transaction
                        off-platform, your account will be immediately terminated.
                        Furthermore, you will be subject to direct legal action and held
                        liable for liquidated damages equal to the maximum anticipated
                        technology fees, plus all associated attorney fees and court
                        costs incurred by TRACT Inc. in enforcing this provision.
                    </li>
                </ul>
            </>
        ),
    },
    {
        number: "5",
        title: "Data Privacy & Document Verification",
        body: (
            <>
                <p>
                    To maintain a secure marketplace, Users are required to upload
                    verification documents (e.g., identity verification, entity
                    formation documents, Proof of Funds).
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Strictly for Verification:
                        </span>{" "}
                        These documents are utilized exclusively for internal platform
                        verification, fraud prevention, and compliance.
                    </li>
                    <li>
                        <span className="font-semibold text-[var(--color-text-main)]">
                            Data Security:
                        </span>{" "}
                        TRACT Inc. employs strict data security protocols. Your private
                        financial and verification documents will not be sold,
                        distributed, or shared with any unauthorized third-party
                        marketing agencies.
                    </li>
                </ul>
            </>
        ),
    },
    {
        number: "6",
        title: "Limitation of Liability & Role of TRACT Inc.",
        body: (
            <>
                <p>
                    TRACT Inc. is exclusively a technology provider and Software as a
                    Service (SaaS) platform.
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        TRACT Inc. is not a licensed real estate brokerage, agent, title
                        company, or escrow officer in the State of New Jersey or any
                        other jurisdiction.
                    </li>
                    <li>
                        We do not represent any party in a fiduciary capacity and hold
                        zero liability for the performance, default, or financial loss
                        resulting from any real estate contract generated between Users.
                    </li>
                </ul>
            </>
        ),
    },
];

function DisclaimerCard({
    icon: Icon,
    eyebrow,
    title,
    tone,
    children,
}: {
    icon: any;
    eyebrow: string;
    title: string;
    tone: "warning" | "info" | "primary";
    children: ReactNode;
}) {
    const toneStyles: Record<typeof tone, string> = {
        warning:
            "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 text-[var(--color-warning)]",
        info: "border-[var(--color-info)]/30 bg-[var(--color-info)]/5 text-[var(--color-info)]",
        primary:
            "border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 text-[var(--color-primary)]",
    };

    return (
        <div
            className={`rounded-2xl border p-5 sm:p-6 ${toneStyles[tone]}`}
        >
            <div className="mb-3 flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em]">
                        {eyebrow}
                    </p>
                    <h3 className="mt-0.5 text-base font-black">{title}</h3>
                </div>
            </div>

            <div className="text-sm leading-6 text-[var(--color-text-main)]">
                {children}
            </div>
        </div>
    );
}

export default function TermsOfService() {
    return (
        <div className="min-h-screen w-full bg-[var(--color-bg-main)] px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl">
                {/* Back link */}
                <Link
                    to="/auth/signup"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign Up
                </Link>

                {/* Header */}
                <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <img
                                    src={tractLogo}
                                    alt="TRACT logo"
                                    className="h-8 w-8 object-contain"
                                />
                                <span className="text-lg font-extrabold tracking-tight text-[var(--color-primary)]">
                                    TRACT
                                </span>
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                                Legal
                            </p>

                            <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)] sm:text-4xl">
                                TRACT Inc. Terms of Service & Beta Participation Agreement
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
                                Effective Date: [Insert Launch Date, 2026] &middot; Governing
                                Law: State of New Jersey, United States
                            </p>
                        </div>

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[var(--color-secondary)]/20 text-[var(--color-primary)]">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                    </div>

                    <p className="mt-6 border-t border-[var(--color-border-light)] pt-6 text-sm leading-7 text-[var(--color-text-main)]">
                        This Agreement constitutes a legally binding contract between you
                        ("User," "Wholesaler," "Buyer," or "Asset Provider") and TRACT
                        Inc. ("Company," "we," "us," or "our"). By accessing or using the
                        TRACT and Buy TRACT applications (the "Platform"), you agree to
                        be bound by these terms.
                    </p>
                </section>

                {/* Numbered sections */}
                <div className="mt-8 space-y-6">
                    {SECTIONS.map((section) => (
                        <section
                            key={section.number}
                            className="rounded-3xl border border-[var(--color-border-light)] bg-white p-7 shadow-[var(--shadow-card)]"
                        >
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-sm font-black text-[var(--color-primary)]">
                                    {section.number}
                                </div>

                                <h2 className="font-serif text-xl font-black text-[var(--color-primary)] sm:text-2xl">
                                    {section.title}
                                </h2>
                            </div>

                            <div className="text-sm leading-7 text-[var(--color-text-main)]">
                                {section.body}
                            </div>
                        </section>
                    ))}
                </div>

                {/* In-App Disclaimers */}
                <section className="mt-8 rounded-3xl border border-[var(--color-border-light)] bg-white p-7 shadow-[var(--shadow-card)] sm:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                        In-App Disclaimers
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-black text-[var(--color-primary)]">
                        To be displayed as pop-ups or mandatory check-boxes during
                        onboarding and right before a user executes a contract
                    </h2>

                    <div className="mt-6 space-y-5">
                        <DisclaimerCard
                            icon={AlertTriangle}
                            eyebrow="Warning"
                            title="Mandatory Off-Platform Warning"
                            tone="warning"
                        >
                            <p>
                                <span className="font-semibold">Protect Yourself from Fraud:</span>{" "}
                                Attempting to take a transaction off the TRACT platform
                                exposes you to severe risk of financial scams, clouded
                                titles, and loss of your equitable interest or capital. TRACT
                                cannot protect your EMD, track your transaction, or verify
                                the opposing party if you communicate or execute agreements
                                outside of our secure infrastructure.
                            </p>

                            <p className="mt-3">
                                <span className="font-semibold">Legal Notice:</span> Bypassing
                                TRACT to close a deal discovered on this app is a direct
                                violation of our Terms of Service. TRACT tracks interaction
                                anomalies. Violators will face immediate, permanent account
                                bans and aggressive legal action to recover circumvention
                                damages under New Jersey law.
                            </p>
                        </DisclaimerCard>

                        <DisclaimerCard
                            icon={Lock}
                            eyebrow="Disclosure"
                            title="Data Security Disclosure"
                            tone="info"
                        >
                            <p>
                                The documents you are about to submit (Proof of Funds,
                                Identity Verification) are encrypted and used strictly by our
                                internal compliance team to verify you as a legitimate
                                participant in our marketplace. TRACT Inc. does not sell
                                your private data to third parties.
                            </p>
                        </DisclaimerCard>

                        <DisclaimerCard
                            icon={ShieldCheck}
                            eyebrow="Disclosure"
                            title="Platform Role & SaaS Fee Disclosure"
                            tone="primary"
                        >
                            <p>
                                By proceeding, you acknowledge that TRACT Inc. provides
                                software infrastructure and is not a licensed real estate
                                broker representing you. The $50/$100 payment required today
                                is a non-refundable SaaS Platform Use Fee granting you access
                                to our technology, irrespective of whether your real estate
                                transaction successfully closes.
                            </p>
                        </DisclaimerCard>
                    </div>
                </section>

                {/* Bottom back link */}
                <div className="mt-8 text-center">
                    <Link
                        to="/auth/signup"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}