"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import { FullPageLoader, Spinner } from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Search, Send, Eye, FileUp } from "lucide-react";
import type { Assignment, Submission } from "@/lib/types";
import { getErrorMessage, formatDateTime, isPastDeadline } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Submit modal
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aRes, sRes] = await Promise.all([
        api.get<Assignment[]>("/assignments"),
        api.get<Submission[]>("/submissions"),
      ]);
      setAssignments(aRes.data ?? []);
      setMySubmissions(sRes.data ?? []);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const submittedIds = new Map(mySubmissions.map((s) => [s.assignmentId, s]));

  const filtered = assignments.filter((a) => {
    if (a.status !== "Published") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.subjectName.toLowerCase().includes(q) ||
        (a.className && a.className.toLowerCase().includes(q))
      );
    }
    return true;
  });

  function openSubmit(a: Assignment) {
    const existing = submittedIds.get(a.id);
    if (existing) {
      setSelectedAssignment(a);
      setAnswer(existing.answer ?? "");
      setFile(null);
    } else {
      setSelectedAssignment(a);
      setAnswer("");
      setFile(null);
    }
    setSubmitError("");
    setSubmitModal(true);
  }

  function openDetail(a: Assignment) {
    setDetailAssignment(a);
    setDetailModal(true);
  }

  async function handleSubmit() {
    if (!selectedAssignment) return;
    if (!answer.trim() && !file) {
      setSubmitError("Provide either an answer text or a file.");
      return;
    }
    setSaving(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment.id);
      if (answer.trim()) formData.append("answer", answer.trim());
      if (file) formData.append("file", file);

      const existing = submittedIds.get(selectedAssignment.id);
      if (existing) {
        await api.put(`/submissions/${existing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/submissions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setSubmitModal(false);
      fetchAll();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-sm text-slate-500">View published assignments and submit your work.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Search assignments..."
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
            <div className="p-6 text-center text-sm text-slate-500">No published assignments found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((a) => {
                const sub = submittedIds.get(a.id);
                const pastDue = isPastDeadline(a.deadline);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{a.title}</p>
                        {sub && <Badge variant={sub.status === "Graded" ? "green" : sub.status === "Late" ? "red" : "yellow"}>{sub.status}</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">
                        {a.subjectName} · {a.className} · Due: {formatDateTime(a.deadline)}
                        {pastDue && !sub && <span className="ml-1 text-red-500 font-medium">(Overdue)</span>}
                      </p>
                      {sub && sub.marksObtained !== null && (
                        <p className="text-xs text-slate-500">
                          Marks: <span className="font-medium text-slate-700">{sub.marksObtained}</span> / {a.maxMarks}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openDetail(a)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(!pastDue || sub) && (
                        <button
                          onClick={() => openSubmit(a)}
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                          title={sub ? "Update Submission" : "Submit"}
                        >
                          {sub ? <FileUp className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Modal */}
      <Modal open={submitModal} onClose={() => setSubmitModal(false)} title={submittedIds.get(selectedAssignment?.id ?? "") ? "Update Submission" : "Submit Assignment"} wide>
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-900">{selectedAssignment.title}</p>
              <p className="text-xs text-slate-500">
                {selectedAssignment.subjectName} · {selectedAssignment.className} · Max Marks: {selectedAssignment.maxMarks}
              </p>
              <p className="text-xs text-slate-500">
                Deadline: {formatDateTime(selectedAssignment.deadline)}
              </p>
              {selectedAssignment.description && (
                <p className="mt-1 text-xs text-slate-600">{selectedAssignment.description}</p>
              )}
            </div>
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Your Answer</label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
              />
              <p className="mt-1 text-xs text-slate-400">Max 5000 characters.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Attach File (optional)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-slate-400">Allowed: PDF, DOC, DOCX, XLS, XLSX (max 10MB).</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSubmitModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={saving}>
                {submittedIds.get(selectedAssignment.id) ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Assignment Details">
        {detailAssignment && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Title</p>
                <p className="text-slate-900">{detailAssignment.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Subject</p>
                <p className="text-slate-900">{detailAssignment.subjectName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Class</p>
                <p className="text-slate-900">{detailAssignment.className}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Teacher</p>
                <p className="text-slate-900">{detailAssignment.teacherName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Deadline</p>
                <p className="text-slate-900">{formatDateTime(detailAssignment.deadline)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Max Marks</p>
                <p className="text-slate-900">{detailAssignment.maxMarks}</p>
              </div>
            </div>
            {detailAssignment.description && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  {detailAssignment.description}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}