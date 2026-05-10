import { ShieldCheck, KeyRound, Building, User, Mail, Phone, Lock, Eye, EyeOff, Map, Medal, Users, Briefcase, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  state: z.string().min(1, "Please select a state"),
  role: z.enum(["seller", "partner", "licensed"]),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function EntryPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "seller",
      terms: false
    }
  });

  const selectedRole = watch("role");

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Navigate based on role just to show functionality
    if (data.role === 'seller') navigate("/seller/dashboard");
    else if (data.role === 'partner') navigate("/partner/dashboard");
    else if (data.role === 'licensed') navigate("/realtor/dashboard");
  };

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

  return (
    <AuthLayout
      title={<>Intelligent.<br />Secure. Built for<br />Real Estate.</>}
      subtitle="Join TRACT App 1 to streamline property operations with secure access, smart automation, and real-time insights."
      features={features}
      bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-black">Create your account</h2>
        <p className="text-gray-500 mt-2 text-sm">Join TRACT App 1 and unlock the future of real estate.</p>

        <div className="flex items-center justify-center my-6">
          <div className="w-16 h-px bg-gray-200"></div>
          <div className="w-2 h-2 rounded-full bg-[#a88a45] mx-4"></div>
          <div className="w-16 h-px bg-gray-200"></div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="h-5 w-5" />
            </div>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Enter your full name"
              className={`block w-full pl-10 pr-3 py-2.5 bg-[#f5f4ef] border-transparent rounded-lg text-sm focus:border-[#a88a45] focus:ring-[#a88a45] focus:bg-white transition-colors ${errors.fullName ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                {...register("phone")}
                type="tel"
                placeholder="(555) 123-4567"
                className={`block w-full pl-10 pr-3 py-2.5 bg-[#f5f4ef] border-transparent rounded-lg text-sm focus:border-[#a88a45] focus:ring-[#a88a45] focus:bg-white transition-colors ${errors.phone ? 'border-red-300 ring-1 ring-red-300' : ''}`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`block w-full pl-10 pr-10 py-2.5 bg-[#f5f4ef] border-transparent rounded-lg text-sm focus:border-[#a88a45] focus:ring-[#a88a45] focus:bg-white transition-colors ${errors.confirmPassword ? 'border-red-300 ring-1 ring-red-300' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Map className="h-5 w-5" />
            </div>
            <select
              {...register("state")}
              className={`block w-full pl-10 pr-3 py-2.5 bg-[#f5f4ef] border-transparent rounded-lg text-sm focus:border-[#a88a45] focus:ring-[#a88a45] focus:bg-white transition-colors appearance-none ${errors.state ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            >
              <option value="">Select your state</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="NY">New York</option>
              <option value="FL">Florida</option>
            </select>
          </div>
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            Select your role
            <span className="text-gray-400 text-xs border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center cursor-help">i</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`relative border rounded-lg p-4 cursor-pointer text-center transition-all ${selectedRole === 'seller' ? 'border-[#a88a45] bg-[#fffcf5]' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setValue('role', 'seller', { shouldValidate: true })}
            >
              {selectedRole === 'seller' && (
                <div className="absolute top-2 right-2 bg-[#a88a45] rounded-full p-0.5">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 mx-auto bg-[#f8eecd] text-[#a88a45] rounded-lg flex items-center justify-center mb-2">
                <Medal className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm text-gray-900">Seller</div>
              <div className="text-[10px] text-gray-500 mt-1 leading-tight">List and manage your properties.</div>
            </div>

            <div
              className={`relative border rounded-lg p-4 cursor-pointer text-center transition-all ${selectedRole === 'partner' ? 'border-[#a88a45] bg-[#fffcf5]' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setValue('role', 'partner', { shouldValidate: true })}
            >
              {selectedRole === 'partner' && (
                <div className="absolute top-2 right-2 bg-[#a88a45] rounded-full p-0.5">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 mx-auto bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm text-gray-900">Private<br />Partner</div>
              <div className="text-[10px] text-gray-500 mt-1 leading-tight">Collaborate and manage deals.</div>
            </div>

            <div
              className={`relative border rounded-lg p-4 cursor-pointer text-center transition-all ${selectedRole === 'licensed' ? 'border-[#a88a45] bg-[#fffcf5]' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setValue('role', 'licensed', { shouldValidate: true })}
            >
              {selectedRole === 'licensed' && (
                <div className="absolute top-2 right-2 bg-[#a88a45] rounded-full p-0.5">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 mx-auto bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm text-gray-900">Licensed<br />Partner</div>
              <div className="text-[10px] text-gray-500 mt-1 leading-tight">Represent clients and close deals.</div>
            </div>
          </div>
          {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
        </div>

        <div>
          <div className="flex items-start gap-2 pt-2">
            <input
              {...register("terms")}
              type="checkbox"
              id="terms"
              className={`mt-1 w-4 h-4 text-[#a88a45] border-gray-300 rounded focus:ring-[#a88a45] ${errors.terms ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I agree to the <a href="#" className="font-medium text-black hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-black hover:underline">Privacy Policy</a>
            </label>
          </div>
          {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms.message}</p>}
        </div>

        <button type="submit" className="w-full bg-black text-white rounded-lg py-3.5 text-sm font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mt-4">
          CREATE ACCOUNT <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/auth/signin" className="font-semibold text-[#a88a45] hover:underline">Sign in →</Link>
        </div>

        <div className="mt-6 bg-[#fffcf5] border border-[#f2e6c8] rounded-lg p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[#a88a45] flex-shrink-0" />
          <div className="text-xs text-gray-700 flex-grow leading-relaxed">
            Your identity will be securely verified to protect your account and ensure a trusted community.
          </div>
          <a href="#" className="text-xs font-semibold text-black whitespace-nowrap self-center">Learn more</a>
        </div>
      </form>
    </AuthLayout>
  );
}
