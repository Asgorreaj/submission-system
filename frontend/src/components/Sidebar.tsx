import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";
import type { Role } from "@/lib/types";

const navByRole: Record<Role, { href: string; label: string }[]> = {
  Admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/classes", label: "Classes" },
    { href: "/dashboard/admin/subjects", label: "Subjects" },
    { href: "/dashboard/admin/submissions", label: "Submissions" },
  ],
  Teacher: [
    { href: "/dashboard/teacher", label: "Overview" },
    { href: "/dashboard/teacher/assignments", label: "Assignments" },
    { href: "/dashboard/teacher/submissions", label: "Submissions" },
  ],
  Student: [
    { href: "/dashboard/student", label: "Overview" },
    { href: "/dashboard/student/assignments", label: "My Assignments" },
    { href: "/dashboard/student/submissions", label: "My Submissions" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const items = navByRole[user.role] || [];
  const roleColor: Record<Role, string> = {
    Admin: "bg-purple-600",
    Teacher: "bg-emerald-600",
    Student: "bg-blue-600",
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-white", roleColor[user.role])}>
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Submission System</p>
          <p className="text-xs text-slate-500">{user.role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-slate-800">{user.fullName}</p>
          <p className="truncate text-xs text-slate-500">{user.loginId}</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}