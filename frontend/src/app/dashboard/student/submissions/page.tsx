"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { FullPageLoader, Spinner } from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Search, Eye, Download, FileText } from "lucide-react";
import type { Submission } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Submitted: "yellow",
  Late: "red",
  Graded: "green",
};

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [detailModal, setDetailModal] = useState(false);
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
    if (!search) return true;
    const q = search.toLowerCase();
    return s.assignmentTitle.toLowerCase().includes(q);
  });

  function openDetail(s: Submission) {
    setDetailSubmission(s);
    setDetailModal(true);
  }

  function handleDownload(s: Submission) {
    window.open(`${api.defaults.baseURL}/submissions/${s.id}/file`, "_blank");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Submissions</h1>
        <p className="text-sm text-slate-500">Track your submissions and check grades.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Search by assignment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                    <th className="px-4 py-3">Assignment</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="max-w-[250px] px-4 py-3 font-medium text-slate-900">
                        <p className="truncate">{s.assignmentTitle}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(s.submittedAt)}</td>
                      <td className="px-4 py-3">
                        {s.marksObtained !== null ? (
                          <span className="font-medium text-slate-900">{s.marksObtained}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
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
                            <Eye className="h-4 w-4" />
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

      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Submission Details">
        {detailSubmission && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
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
                  <p className="text-xs font-medium text-slate-500">Marks Obtained</p>
                  <p className="text-lg font-bold text-slate-900">{detailSubmission.marksObtained}</p>
                </div>
              )}
              {detailSubmission.feedback && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500">Feedback</p>
                  <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 whitespace-pre-wrap">
                    {detailSubmission.feedback}
                  </div>
                </div>
              )}
              {detailSubmission.hasFile && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500">Attached File</p>
                  <button
                    onClick={() => handleDownload(detailSubmission)}
                    className="mt-1 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <Download className="h-4 w-4" /> {detailSubmission.fileName ?? "Download"}
                  </button>
                </div>
              )}
            </div>
            {detailSubmission.answer && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Your Answer</p>
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