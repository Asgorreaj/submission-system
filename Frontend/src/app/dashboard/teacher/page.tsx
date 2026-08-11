"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { FileText, ClipboardList, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import type { Assignment, Submission } from "@/lib/types";

export default function TeacherOverview() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [aRes, sRes] = await Promise.all([
          api.get<Assignment[]>("/assignments"),
          api.get<Submission[]>("/submissions"),
        ]);
        setAssignments(aRes.data ?? []);
        setSubmissions(sRes.data ?? []);
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <FullPageLoader label="Loading dashboard..." />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  const draftCount = assignments.filter((a) => a.status === "Draft").length;
  const publishedCount = assignments.filter((a) => a.status === "Published").length;
  const ungradedCount = submissions.filter((s) => s.status !== "Graded").length;
  const gradedCount = submissions.filter((s) => s.status === "Graded").length;

  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
    .slice(0, 5);

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your assignments and grade submissions.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{draftCount}</p>
            <p className="text-xs text-slate-500">Draft Assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{publishedCount}</p>
            <p className="text-xs text-slate-500">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{ungradedCount}</p>
            <p className="text-xs text-slate-500">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{gradedCount}</p>
            <p className="text-xs text-slate-500">Graded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {recentAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.className} · {a.subjectName}
                      </p>
                    </div>
                    <Badge variant={a.status === "Published" ? "green" : "yellow"}>
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/teacher/assignments"
              className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Assignments <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-slate-500">No submissions yet.</p>
            ) : (
              <div className="space-y-2">
                {recentSubmissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{s.studentName}</p>
                      <p className="text-xs text-slate-500">{s.assignmentTitle}</p>
                    </div>
                    <Badge variant={s.status === "Graded" ? "green" : s.status === "Late" ? "red" : "yellow"}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/teacher/submissions"
              className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Submissions <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}