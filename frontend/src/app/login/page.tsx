"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function LoginForm() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
            A
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Assignment &amp; Submission System
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in with your Login ID and password
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="loginId" className="mb-1.5 block text-sm font-medium text-slate-700">
              Login ID
            </label>
            <Input
              id="loginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. ADM-26-0001"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Demo Credentials
          </p>
          <div className="space-y-1 text-xs text-slate-600">
            <p>
              <span className="font-medium text-purple-700">Admin</span> — ADM-26-0001 / Admin@123
            </p>
            <p>
              <span className="font-medium text-emerald-700">Teacher</span> — TCH-26-0001 / Teacher@123
            </p>
            <p>
              <span className="font-medium text-blue-700">Student</span> — STU-26-0001 / Student@123
            </p>
          </div>
        </div>
      </div>
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
