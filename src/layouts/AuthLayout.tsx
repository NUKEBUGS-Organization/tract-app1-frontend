import React from "react";
import { Building2 } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  features?: Feature[];
  featuresInCard?: boolean;
  bgImage?: string;
  darkOverlay?: boolean;
}

const defaultBg = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

export default function AuthLayout({
  children,
  title,
  subtitle,
  features,
  featuresInCard,
  bgImage = defaultBg,
  darkOverlay = false,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#fcfbf9] text-[#1a1a1a]">
      {/* Left side banner */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Overlay gradient */}
        <div
          className={`absolute inset-0 z-0 ${
            darkOverlay
              ? "bg-gradient-to-b from-black/40 via-black/20 to-black/80"
              : "bg-gradient-to-b from-white/90 via-white/70 to-white/90"
          }`}
        />

        {/* Header content */}
        <div className="relative z-10 p-12 flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center gap-2 text-2xl font-bold tracking-tight ${darkOverlay ? "text-white" : "text-black"}`}>
            <Building2 className="w-8 h-8" />
            TRACT
          </div>

          <div className="mt-24 max-w-lg">
            <h1 className={`text-5xl font-serif font-bold leading-tight ${darkOverlay ? "text-white" : "text-black"}`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`mt-6 text-lg leading-relaxed ${darkOverlay ? "text-gray-200" : "text-gray-700"}`}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex-grow" />

          {/* Features */}
          {features && features.length > 0 && (
            <div
              className={`mt-12 grid grid-cols-3 gap-6 ${
                featuresInCard
                  ? "bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100"
                  : ""
              }`}
            >
              {features.map((f, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="text-[#a88a45]">{f.icon}</div>
                  <h3 className={`font-semibold text-sm ${darkOverlay && !featuresInCard ? "text-white" : "text-black"}`}>
                    {f.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${darkOverlay && !featuresInCard ? "text-gray-300" : "text-gray-600"}`}>
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className={`mt-8 text-xs ${darkOverlay && !featuresInCard ? "text-gray-400" : "text-gray-500"}`}>
            © 2024 TRACT Real Estate. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-col w-full lg:w-1/2 overflow-y-auto">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="w-6 h-6" />
            TRACT
          </div>
        </div>

        {/* Top nav (optional, seen in forgot password) */}
        <div className="hidden lg:flex justify-end p-6 gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-black">Solutions</a>
          <a href="#" className="hover:text-black">Investors</a>
          <a href="#" className="hover:text-black">Security</a>
          <div className="flex items-center gap-4 ml-8">
            <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50">?</button>
            <button className="px-4 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-black">Sign In</button>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12">
            {children}
          </div>
        </div>

        {/* Mobile/Form footer */}
        <div className="flex flex-wrap justify-center gap-6 p-6 text-xs text-gray-500 lg:bg-[#fcfbf9]">
          <a href="#" className="hover:text-gray-800">Terms of Service</a>
          <a href="#" className="hover:text-gray-800">Privacy Policy</a>
          <a href="#" className="hover:text-gray-800">Security Compliance</a>
          <a href="#" className="hover:text-gray-800">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
