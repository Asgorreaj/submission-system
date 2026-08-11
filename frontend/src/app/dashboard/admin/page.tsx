"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/Spinner";
import { Users, GraduationCap, BookOpen, FileText, ArrowRight } from "lucide-react";
import type { User, ClassItem, SubjectItem, Assignment } from "@/lib/types";

interface Stats {
  users: number;
  teachers: number;
  students: number;
  classes: number;
  subjects: number;
  assignments: number;
  submissions: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, classesRes, subjectsRes, assignmentsRes, submissionsRes] =
          await Promise.all([
            api.get<User[]>("/users").catch(() => ({ data: [] as User[] })),
            api.get<ClassItem[]>("/classes").catch(() => ({ data: [] as ClassItem[] })),
            api.get<SubjectItem[]>("/subjects").catch(() => ({ data: [] as SubjectItem[] })),
            api.get<Assignment[]>("/assignments").catch(() => ({ data: [] as Assignment[] })),
            api.get<unknown[]>("/submissions").catch(() => ({ data: [] })),
          ]);

        const users = usersRes.data ?? [];
        const classes = classesRes.data ?? [];
        const subjects = subjectsRes.data ?? [];
        const assignments = assignmentsRes.data ?? [];
        const submissions = submissionsRes.data ?? [];

        setStats({
          users: users.length,
          teachers: users.filter((u) => u.role === "Teacher").length,
          students: users.filter((u) => u.role === "Student").length,
          classes: classes.length,
          subjects: subjects.length,
          assignments: assignments.length,
          submissions: submissions.length,
        });
      } catch (err) {
        setError("Failed to load dashboard data.");
      }
    }
    load();
  }, []);

  if (!stats) {
    if (error) return <div className="text-sm text-red-600">{error}</div>;
    return <FullPageLoader label="Loading overview..." />;
  }

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Teachers", value: stats.teachers, icon: GraduationCap, color: "text-emerald-600 bg-emerald-50" },
    { label: "Students", value: stats.students, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Classes", value: stats.classes, icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
    { label: "Subjects", value: stats.subjects, icon: BookOpen, color: "text-amber-600 bg-amber-50" },
    { label: "Assignments", value: stats.assignments, icon: FileText, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500">Manage users, classes, subjects and monitor activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/admin/users"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
            >
              Manage Users
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/admin/classes"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
            >
              Manage Classes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/admin/subjects"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
            >
              Manage Subjects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Total submissions</span>
              <span className="font-semibold text-slate-900">{stats.submissions}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span>Total assignments</span>
              <span className="font-semibold text-slate-900">{stats.assignments}</span>
            </div>
            <div className="flex justify-between">
              <span>Student per class (avg.)</span>
              <span className="font-semibold text-slate-900">
                {stats.classes > 0 ? (stats.students / stats.classes).toFixed(1) : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}