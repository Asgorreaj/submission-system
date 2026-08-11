"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { BookOpen, FileText, CheckCircle2, Clock, ArrowRight, AlertCircle } from "lucide-react";
import type { Assignment, Submission } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function StudentOverview() {
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

  const now = new Date();
  const submittedIds = new Set(submissions.map((s) => s.assignmentId));
  const gradedCount = submissions.filter((s) => s.status === "Graded").length;
  const pendingCount = submissions.filter((s) => s.status !== "Graded").length;
  const availableCount = assignments.filter((a) => a.status === "Published" && !submittedIds.has(a.id)).length;

  // Find upcoming deadlines
  const upcoming = assignments
    .filter((a) => a.status === "Published" && !submittedIds.has(a.id))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // Recent submissions
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-sm text-slate-500">View assignments, submit your work, and check results.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{availableCount}</p>
            <p className="text-xs text-slate-500">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-xs text-slate-500">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{gradedCount}</p>
            <p className="text-xs text-slate-500">Graded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
            <p className="text-xs text-slate-500">Total Published</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No pending assignments. You're all caught up!</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((a) => {
                  const isUrgent = new Date(a.deadline).getTime() - now.getTime() < 86400000;
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                        <p className={`text-xs ${isUrgent ? "text-red-500 font-medium" : "text-slate-500"}`}>
                          Due: {formatDateTime(a.deadline)} {isUrgent ? "(Tomorrow)" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/student/assignments`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Submit
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
            <Link
              href="/dashboard/student/assignments"
              className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Assignments <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-slate-500">You haven't submitted anything yet.</p>
            ) : (
              <div className="space-y-2">
                {recentSubmissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{s.assignmentTitle}</p>
                      <p className="text-xs text-slate-500">
                        {s.marksObtained !== null ? `Marks: ${s.marksObtained}` : "Not graded yet"}
                      </p>
                    </div>
                    <Badge variant={s.status === "Graded" ? "green" : s.status === "Late" ? "red" : "yellow"}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/student/submissions"
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