"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { FullPageLoader, Spinner } from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { SubjectItem, ClassItem, User } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectItem | null>(null);
  const [formData, setFormData] = useState({ name: "", classId: "", teacherId: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        api.get<SubjectItem[]>("/subjects"),
        api.get<ClassItem[]>("/classes"),
        api.get<User[]>("/users?role=Teacher"),
      ]);
      setSubjects(subjectsRes.data ?? []);
      setClasses(classesRes.data ?? []);
      setTeachers(teachersRes.data ?? []);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditing(null);
    setFormData({ name: "", classId: "", teacherId: "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(s: SubjectItem) {
    setEditing(s);
    setFormData({ name: s.name, classId: s.classId, teacherId: s.teacherId });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.classId || !formData.teacherId) {
      setFormError("All fields are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = { name: formData.name.trim(), classId: formData.classId, teacherId: formData.teacherId };
      if (editing) {
        await api.put(`/subjects/${editing.id}`, payload);
      } else {
        await api.post("/subjects", payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete subject "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
          <p className="text-sm text-slate-500">Assign subjects to classes and teachers.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Subject
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
          ) : subjects.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No subjects created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.className}</td>
                      <td className="px-4 py-3 text-slate-500">{s.teacherName}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Subject" : "Create Subject"}>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
            <Select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.section ? ` (${c.section})` : ""}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Teacher</label>
            <Select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <option value="">Select a teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.loginId})
                </option>
              ))}
            </Select>
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