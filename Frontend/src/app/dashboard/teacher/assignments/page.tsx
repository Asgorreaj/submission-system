"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import { FullPageLoader, Spinner } from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Send, Eye } from "lucide-react";
import type { Assignment, ClassItem, SubjectItem } from "@/lib/types";
import { getErrorMessage, formatDateTime } from "@/lib/utils";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "", description: "", deadline: "", maxMarks: 100, classId: "", subjectId: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aRes, cRes, sRes] = await Promise.all([
        api.get<Assignment[]>("/assignments"),
        api.get<ClassItem[]>("/classes"),
        api.get<SubjectItem[]>("/subjects"),
      ]);
      setAssignments(aRes.data ?? []);
      setClasses(cRes.data ?? []);
      setSubjects(sRes.data ?? []);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Filter subjects by selected class
  const filteredSubjects = subjects.filter((s) => !formData.classId || s.classId === formData.classId);

  function openCreate() {
    setEditing(null);
    setFormData({ title: "", description: "", deadline: "", maxMarks: 100, classId: "", subjectId: "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(a: Assignment) {
    setEditing(a);
    setFormData({
      title: a.title,
      description: a.description ?? "",
      deadline: new Date(a.deadline).toISOString().slice(0, 16),
      maxMarks: a.maxMarks,
      classId: a.classId,
      subjectId: a.subjectId,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.deadline || !formData.classId || !formData.subjectId) {
      setFormError("All required fields must be filled.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        deadline: new Date(formData.deadline).toISOString(),
        maxMarks: formData.maxMarks,
        classId: formData.classId,
        subjectId: formData.subjectId,
      };
      if (editing) {
        await api.put(`/assignments/${editing.id}`, payload);
      } else {
        await api.post("/assignments", payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: string) {
    try {
      await api.put(`/assignments/${id}/publish`);
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete assignment "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
          <p className="text-sm text-slate-500">Create, publish, and manage assignments.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> New Assignment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No assignments created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Class / Subject</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Max Marks</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="truncate font-medium text-slate-900">{a.title}</p>
                        {a.description && (
                          <p className="truncate text-xs text-slate-400">{a.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.className} / {a.subjectName}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(a.deadline)}</td>
                      <td className="px-4 py-3 text-slate-500">{a.maxMarks}</td>
                      <td className="px-4 py-3">
                        <Badge variant={a.status === "Published" ? "green" : "yellow"}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "Draft" && (
                            <button
                              onClick={() => handlePublish(a.id)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                              title="Publish"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          {a.status === "Published" && (
                            <button
                              onClick={() => handlePublish(a.id)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              title="Unpublish"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(a)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.title)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Assignment" : "Create Assignment"} wide>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
              <Select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: "" })}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ""}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
              <Select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              >
                <option value="">Select subject</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deadline</label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Max Marks</label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description (optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Assignment details, instructions..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}