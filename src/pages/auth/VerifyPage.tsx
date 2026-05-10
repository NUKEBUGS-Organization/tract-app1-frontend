import { ShieldCheck, KeyRound, Building, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { Link } from "react-router";
import { useState, useRef, type KeyboardEvent } from "react";

export default function VerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Secure by design",
      description: "Enterprise-grade security and data protection",
    },
    {
      icon: <KeyRound className="w-5 h-5" />,
      title: "Role-based access",
      description: "Granular permissions for every user",
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: "Built for scale",
      description: "Reliable, performant, and future-ready",
    },
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <AuthLayout
      title={<>Intelligent.<br/>Secure.<br/><span className="text-[#a88a45]">Built for Real Estate.</span></>}
      subtitle="TRACT streamlines property operations with secure access, smart automation, and real-time insights."
      features={features}
      featuresInCard={true}
      bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-black">Verify your account</h2>
        <p className="text-gray-500 mt-2 text-sm flex items-center justify-center gap-2">
          We've sent a 6-digit code to 
        </p>
        <div className="inline-flex items-center gap-2 mt-3 bg-[#f5f4ef] px-4 py-2 rounded-full text-sm font-medium text-gray-800">
          <Mail className="w-4 h-4 text-gray-400" />
          you@company.com
        </div>
        
        <div className="flex items-center justify-center my-8">
          <div className="w-16 h-px bg-gray-200"></div>
          <div className="w-2 h-2 rounded-sm bg-[#a88a45] mx-4 rotate-45"></div>
          <div className="w-16 h-px bg-gray-200"></div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-bold tracking-wider text-center text-black mb-4 uppercase">Enter the 6-digit code</label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-[#a88a45] focus:ring-1 focus:ring-[#a88a45] focus:outline-none transition-colors"
                placeholder="-"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm px-2">
          <div className="text-gray-500 flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Code expires in 02:45
          </div>
          <button type="button" className="font-semibold text-[#a88a45] hover:underline">
            Resend code
          </button>
        </div>

        <button type="submit" className="w-full bg-black text-white rounded-lg py-3.5 text-sm font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mt-6">
          VERIFY & CONTINUE <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative my-8 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="text-center">
          <Link to="/auth/entry" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Change email or go back
          </Link>
        </div>

        <div className="mt-8 bg-[#faf9f5] border border-gray-100 rounded-lg p-5 flex gap-4">
          <ShieldCheck className="w-5 h-5 text-[#a88a45] flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-1">Institutional Security</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your data is protected with industry-leading security and compliance standards. <a href="#" className="font-semibold text-[#a88a45]">Learn more</a>
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
