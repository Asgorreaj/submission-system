"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { FullPageLoader, Spinner } from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Search, CheckCircle, Download, FileText } from "lucide-react";
import type { Submission } from "@/lib/types";
import { getErrorMessage, formatDateTime } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Submitted: "yellow",
  Late: "red",
  Graded: "green",
};

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Grading modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({ marksObtained: 0, feedback: "" });
  const [saving, setSaving] = useState(false);
  const [gradeError, setGradeError] = useState("");

  // Detail view modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailSubmission, setDetailSubmission] = useState<Submission | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Submission[]>("/submissions");
      setSubmissions(res.data ?? []);
    } catch {
      setError("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = submissions.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.assignmentTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openGrade(s: Submission) {
    setGradingSubmission(s);
    setGradeData({ marksObtained: s.marksObtained ?? 0, feedback: s.feedback ?? "" });
    setGradeError("");
    setGradeModalOpen(true);
  }

  function openDetail(s: Submission) {
    setDetailSubmission(s);
    setDetailModalOpen(true);
  }

  async function handleGrade() {
    if (!gradingSubmission) return;
    setSaving(true);
    setGradeError("");
    try {
      await api.put(`/submissions/${gradingSubmission.id}/grade`, gradeData);
      setGradeModalOpen(false);
      fetchAll();
    } catch (err) {
      setGradeError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleDownload(s: Submission) {
    window.open(`${api.defaults.baseURL}/submissions/${s.id}/file`, "_blank");
  }

  const ungradedFirst = [...filtered].sort((a, b) => {
    if (a.status === "Graded" && b.status !== "Graded") return 1;
    if (a.status !== "Graded" && b.status === "Graded") return -1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <p className="text-sm text-slate-500">Review and grade student submissions.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search by student or assignment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
              <option value="">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Late">Late</option>
              <option value="Graded">Graded</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No submissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Assignment</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ungradedFirst.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{s.studentName}</td>
                      <td className="max-w-[200px] px-4 py-3 text-slate-500">
                        <p className="truncate">{s.assignmentTitle}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(s.submittedAt)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.marksObtained !== null ? s.marksObtained : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[s.status] as any}>{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(s)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            title="View Details"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {s.hasFile && (
                            <button
                              onClick={() => handleDownload(s)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                              title="Download File"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openGrade(s)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Grade"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Modal */}
      <Modal open={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Grade Submission">
        {gradingSubmission && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p><span className="font-medium">Student:</span> {gradingSubmission.studentName}</p>
              <p><span className="font-medium">Assignment:</span> {gradingSubmission.assignmentTitle}</p>
              <p><span className="font-medium">Submitted:</span> {formatDateTime(gradingSubmission.submittedAt)}</p>
            </div>
            {gradeError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{gradeError}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Marks Obtained</label>
              <Input
                type="number"
                min={0}
                value={gradeData.marksObtained}
                onChange={(e) => setGradeData({ ...gradeData, marksObtained: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Feedback</label>
              <Textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                placeholder="Provide feedback to the student..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setGradeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleGrade} loading={saving}>Submit Grade</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Submission Details">
        {detailSubmission && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Student</p>
                <p className="text-slate-900">{detailSubmission.studentName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Assignment</p>
                <p className="text-slate-900">{detailSubmission.assignmentTitle}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Submitted</p>
                <p className="text-slate-900">{formatDateTime(detailSubmission.submittedAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Status</p>
                <Badge variant={statusColors[detailSubmission.status] as any}>{detailSubmission.status}</Badge>
              </div>
              {detailSubmission.marksObtained !== null && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Marks</p>
                  <p className="text-slate-900">{detailSubmission.marksObtained}</p>
                </div>
              )}
              {detailSubmission.feedback && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500">Feedback</p>
                  <p className="text-slate-900 whitespace-pre-wrap">{detailSubmission.feedback}</p>
                </div>
              )}
              {detailSubmission.hasFile && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500">File</p>
                  <button
                    onClick={() => handleDownload(detailSubmission)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <Download className="h-4 w-4" /> {detailSubmission.fileName ?? "Download"}
                  </button>
                </div>
              )}
            </div>
            {detailSubmission.answer && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Answer</p>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 whitespace-pre-wrap text-slate-700">
                  {detailSubmission.answer}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}