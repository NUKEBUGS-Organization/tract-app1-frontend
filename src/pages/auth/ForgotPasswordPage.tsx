import { Mail, ArrowRight, ArrowLeft, RotateCcw, ShieldCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    console.log("Reset Password requested for:", data);
    setIsSubmitted(true);
  };

  return (
    <AuthLayout
      title={<>Architectural<br/>precision for<br/>investment<br/>mastery.</>}
      subtitle="Secure, reliable, and built for the next generation of real estate operations."
      bgImage="https://images.unsplash.com/photo-1541884053360-6bd67fb72a8c?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-[#f8eecd] flex items-center justify-center mx-auto mb-6">
          <RotateCcw className="w-6 h-6 text-[#a88a45]" />
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-black">Reset your password</h2>
        <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
          {isSubmitted 
            ? "If an account exists for that email, we have sent password reset instructions."
            : "Enter your email and we'll send you instructions to reset your password."}
        </p>
        
        <div className="flex items-center justify-center my-8">
          <div className="w-16 h-px bg-gray-200"></div>
          <div className="w-2 h-2 rotate-45 bg-[#d8c28b] mx-4"></div>
          <div className="w-16 h-px bg-gray-200"></div>
        </div>
      </div>

      {!isSubmitted ? (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className={`block w-full pl-10 pr-3 py-3 bg-[#fcfbf9] border border-gray-200 rounded-lg text-sm focus:border-[#a88a45] focus:ring-1 focus:ring-[#a88a45] focus:bg-white transition-colors ${errors.email ? 'border-red-300 ring-1 ring-red-300' : ''}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <button type="submit" className="w-full bg-black text-white rounded-lg py-3.5 text-sm font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mt-2">
            SEND RESET LINK <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="text-center">
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-[#f5f4ef] text-black border border-gray-200 rounded-lg py-3.5 text-sm font-semibold hover:bg-gray-100 transition-colors mt-2"
          >
            TRY ANOTHER EMAIL
          </button>
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/auth/signin" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>

      <div className="mt-10 bg-[#faf9f5] border border-gray-100 rounded-lg p-5 flex gap-4">
        <ShieldCheck className="w-5 h-5 text-[#8c7335] flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-gray-900 mb-1">Your security is our priority</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Resetting your password triggers an encrypted authentication flow. If you do not receive an email within 5 minutes, please check your spam folder or contact institutional support.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
