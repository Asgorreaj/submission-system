// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import { getErrorMessage } from "@/lib/utils";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";

// function LoginForm() {
//   const [loginId, setLoginId] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!loginId.trim() || !password) {
//       setError("Please enter both Login ID and password.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const user = await login({ loginId: loginId.trim(), password });
//       router.push(`/dashboard/${user.role.toLowerCase()}`);
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Demo credential fast fill helper
//   const handleQuickFill = (id: string, pass: string) => {
//     setLoginId(id);
//     setPassword(pass);
//     setError("");
//   };

//   return (
//     <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      
//       <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-40 blur-3xl animate-pulse"></div>
//       <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-700 opacity-30 blur-3xl animate-pulse [animation-delay:2s]"></div>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      
//       <div className="relative z-10 w-full max-w-md space-y-6">
        
//         {/* Header Icon & Titles */}
//         <div className="text-center space-y-2">
//           <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-3xl font-black text-white shadow-xl shadow-indigo-500/25 transition-transform hover:scale-105 duration-300">
//             <span className="drop-shadow-md">A</span>
//             <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur"></div>
//           </div>

//           <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//             Assignment Portal
//           </h1>
//           <p className="text-xs text-slate-400 font-medium">
//             Sign in to access your role-based control system
//           </p>
//         </div>

//         {/* Login Form Box */}
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all"
//         >
//           {error && (
//             <div className="animate-headShake rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 backdrop-blur-sm">
//               <span className="font-semibold">Error:</span> {error}
//             </div>
//           )}

//           {/* Login ID Input */}
//           <div className="space-y-1.5">
//             <label htmlFor="loginId" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
//               Login ID
//             </label>
//             <div className="relative">
//               <Input
//                 id="loginId"
//                 value={loginId}
//                 onChange={(e) => setLoginId(e.target.value)}
//                 placeholder="e.g. ADM-26-0001"
//                 autoComplete="username"
//                 className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500/20"
//               />
//             </div>
//           </div>

//           {/* Password Input */}
//           <div className="space-y-1.5">
//             <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
//               Password
//             </label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 autoComplete="current-password"
//                 className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500/20"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-200"
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <Button
//             type="submit"
//             loading={loading}
//             size="lg"
//             className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:shadow-indigo-500/40 active:scale-[0.98]"
//           >
//             Sign In
//           </Button>
//         </form>

//         <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-center backdrop-blur-md">
//           <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
//             ⚡ Click Any Role to Auto-Fill
//           </p>
//           <div className="grid grid-cols-3 gap-2">
//             <button
//               type="button"
//               onClick={() => handleQuickFill("ADM-26-0001", "Admin@123")}
//               className="group rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-center transition hover:border-purple-500/50 hover:bg-purple-500/20"
//             >
//               <div className="text-xs font-bold text-purple-300">Admin</div>
//               <div className="text-[10px] text-slate-400 group-hover:text-slate-200">Fill Info</div>
//             </button>

//             <button
//               type="button"
//               onClick={() => handleQuickFill("TCH-26-0001", "Teacher@123")}
//               className="group rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-center transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
//             >
//               <div className="text-xs font-bold text-emerald-300">Teacher</div>
//               <div className="text-[10px] text-slate-400 group-hover:text-slate-200">Fill Info</div>
//             </button>

//             <button
//               type="button"
//               onClick={() => handleQuickFill("STU-26-0001", "Student@123")}
//               className="group rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-center transition hover:border-blue-500/50 hover:bg-blue-500/20"
//             >
//               <div className="text-xs font-bold text-blue-300">Student</div>
//               <div className="text-[10px] text-slate-400 group-hover:text-slate-200">Fill Info</div>
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default function LoginPage() {
//   return (
//     <AuthProvider>
//       <LoginForm />
//     </AuthProvider>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  School,
  Award,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/utils";

type RoleType = "admin" | "teacher" | "student";

const DEMO_CREDENTIALS = {
  admin: {
    id: "ADM-26-0001",
    pass: "Admin@123",
    label: "Admin",
    icon: ShieldCheck,
  },
  teacher: {
    id: "TCH-26-0001",
    pass: "Teacher@123",
    label: "Teacher",
    icon: UserCheck,
  },
  student: {
    id: "STU-26-0001",
    pass: "Student@123",
    label: "Student",
    icon: GraduationCap,
  },
};

function LoginForm() {
  const [activeRole, setActiveRole] = useState<RoleType>("admin");
  const [loginId, setLoginId] = useState(DEMO_CREDENTIALS.admin.id);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.admin.pass);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleRoleChange = (role: RoleType) => {
    setActiveRole(role);
    setLoginId(DEMO_CREDENTIALS[role].id);
    setPassword(DEMO_CREDENTIALS[role].pass);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginId.trim() || !password) {
      setError("Please enter both Login ID and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ loginId: loginId.trim(), password });
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* LIGHT TOP NAVBAR                                          */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-200">
              A
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-900">
              AssistPro <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">EduHub</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">Overview</a>
            <a href="#architecture" className="hover:text-indigo-600 transition">System Architecture</a>
            <a href="#roles" className="hover:text-indigo-600 transition">Demo Roles</a>
          </nav>
          <a
            href="#login-box"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-200"
          >
            Sign In Portal
          </a>
        </div>
      </header>

      {/* ========================================================= */}
      {/* LIGHT HERO SECTION WITH ANIMATED STUDY ICONS BACKDROP     */}
      {/* ========================================================= */}
      <section className="relative min-h-screen pt-28 pb-16 flex items-center justify-center bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/50">
        
        {/* Animated Background Motion Orbs & Grids */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          
          {/* Floating Educational Vector Icons */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-28 left-[8%] p-4 bg-white/80 rounded-2xl shadow-lg border border-indigo-100 text-indigo-600"
          >
            <GraduationCap className="h-8 w-8" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-[12%] p-4 bg-white/80 rounded-2xl shadow-lg border border-purple-100 text-purple-600"
          >
            <BookOpen className="h-8 w-8" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-36 right-[10%] p-4 bg-white/80 rounded-2xl shadow-lg border border-emerald-100 text-emerald-600"
          >
            <Award className="h-8 w-8" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: HERO INFORMATION */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-indigo-100/70 border border-indigo-200 px-3.5 py-1.5 rounded-full text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Smart Academic Submission Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Empowering <span className="text-indigo-600">Teachers</span> & <span className="text-purple-600">Students</span> with Smart Workflow
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-medium">
              A unified educational management portal designed for seamless assignment creation, real-time grading, and structured academic evaluation.
            </p>

            {/* Micro Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Role-Based Secure Dashboards</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Instant Assignment Evaluation</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Teacher & Student Real-time Sync</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automated Marks Distribution</span>
              </div>
            </div>

            {/* Academic Status Box */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-600 shadow-sm">
              <div className="flex items-center space-x-2 text-slate-400 mb-2 border-b border-slate-100 pb-2">
                <School className="h-4 w-4 text-indigo-600" />
                <span className="text-[11px] font-sans font-bold text-slate-800">System Ready Status: Active</span>
              </div>
              <p className="text-indigo-600 font-semibold">$ system.auth("--role-switching-enabled")</p>
              <p className="text-slate-500">// Select a role on the right card to auto-test</p>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: LIGHT GLASSMORPHISM LOGIN CARD */}
          <motion.div
            id="login-box"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 w-full max-w-md mx-auto space-y-4"
          >
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md">
              {(Object.keys(DEMO_CREDENTIALS) as RoleType[]).map((role) => {
                const Icon = DEMO_CREDENTIALS[role].icon;
                const isActive = activeRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className="relative flex items-center justify-center space-x-1 rounded-xl py-2.5 text-xs font-bold transition duration-200"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeRoleTabLight"
                        className="absolute inset-0 rounded-xl bg-indigo-600 shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center space-x-1 ${isActive ? "text-white" : "text-slate-600 hover:text-slate-900"}`}>
                      <Icon className="h-3.5 w-3.5" />
                      <span>{DEMO_CREDENTIALS[role].label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Login Card */}
            <motion.form
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-xl backdrop-blur-lg"
            >
              <div className="text-center space-y-1 mb-2">
                <h3 className="text-xl font-extrabold text-slate-900">Portal Login</h3>
                <p className="text-xs text-slate-500 font-medium">Click tabs above for one-click demo fill</p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Login ID Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Login ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter Login ID"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition disabled:opacity-50"
              >
                <span>{loading ? "Verifying..." : `Sign In as ${DEMO_CREDENTIALS[activeRole].label}`}</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.form>
          </motion.div>

        </div>
      </section>

    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}