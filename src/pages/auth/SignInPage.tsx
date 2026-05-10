import { ShieldCheck, KeyRound, Building, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowUpRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      remember: false
    }
  });

  const onSubmit = (data: FormData) => {
    console.log("Sign In submitted:", data);
    // Proceed to a default dashboard
    navigate("/seller/dashboard");
  };

  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Secure by design",
      description: "Enterprise-grade security and data protection.",
    },
    {
      icon: <KeyRound className="w-5 h-5" />,
      title: "Role-based access",
      description: "Granular permissions for every single user.",
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: "Built for scale",
      description: "Reliable, performant, and institutional-ready.",
    },
  ];

  return (
    <AuthLayout
      title={<>Intelligent.<br/>Secure. <span className="text-[#a88a45]">Built for<br/>Real Estate.</span></>}
      subtitle="TRACT streamlines property operations with secure access, smart automation, and real-time insights for the modern investor."
      features={features}
      featuresInCard={false}
      bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-black">Welcome back</h2>
        <p className="text-gray-500 mt-2 text-sm">Sign in to continue to TRACT</p>
        
        <div className="flex items-center justify-center my-6">
          <div className="w-16 h-px bg-gray-200"></div>
          <div className="w-2 h-2 rotate-45 bg-[#a88a45] mx-4"></div>
          <div className="w-16 h-px bg-gray-200"></div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
              className={`block w-full pl-10 pr-3 py-2.5 bg-[#f5f4ef] border-transparent rounded-lg text-sm focus:border-[#a88a45] focus:ring-[#a88a45] focus:bg-white transition-colors ${errors.email ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link to="/auth/forgot-password" className="text-xs font-semibold text-[#a88a45] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              className={`block w-full pl-10 pr-10 py-2.5 bg-[#f5f4ef] border-transparent rounded-lg text-sm focus:border-[#a88a45] focus:ring-[#a88a45] focus:bg-white transition-colors ${errors.password ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2 pt-1 pb-2">
          <input 
            {...register("remember")}
            type="checkbox" 
            id="remember" 
            className="w-4 h-4 text-[#7b6121] border-gray-300 rounded focus:ring-[#a88a45]" 
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>

        <button type="submit" className="w-full bg-[#7b6121] text-white rounded-lg py-3.5 text-sm font-semibold hover:bg-[#68521c] transition-colors flex items-center justify-center gap-2 mt-4">
          SIGN IN <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative my-8 flex items-center">
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <div className="text-center text-sm text-gray-600">
          Don't have an account? <Link to="/auth/entry" className="font-semibold text-black hover:text-[#a88a45] transition-colors inline-flex items-center gap-1">Create account <ArrowUpRight className="w-3 h-3" /></Link>
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
