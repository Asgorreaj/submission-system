// "use client";

// import { useEffect, useState, useCallback } from "react";
// import api from "@/lib/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
// import Select from "@/components/ui/Select";
// import Badge from "@/components/ui/Badge";
// import { FullPageLoader, Spinner } from "@/components/ui/Spinner";
// import Modal from "@/components/ui/Modal";
// import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
// import type { User, Role, CreateUserPayload, UpdateUserPayload } from "@/lib/types";
// import { getErrorMessage } from "@/lib/utils";

// const roleColors: Record<Role, string> = {
//   Admin: "purple",
//   Teacher: "green",
//   Student: "blue",
// };

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("");

//   // Modal state
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     role: "Student" as Role,
//     classId: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [formError, setFormError] = useState("");

//   const fetchUsers = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const params = roleFilter ? `?role=${roleFilter}` : "";
//       const res = await api.get<User[]>(`/users${params}`);
//       setUsers(res.data ?? []);
//     } catch (err) {
//       setError("Failed to load users.");
//     } finally {
//       setLoading(false);
//     }
//   }, [roleFilter]);

//   useEffect(() => { fetchUsers(); }, [fetchUsers]);

//   // Filter by search
//   const filtered = users.filter((u) =>
//     !search || u.fullName.toLowerCase().includes(search.toLowerCase()) ||
//     u.loginId.toLowerCase().includes(search.toLowerCase()) ||
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   function openCreate() {
//     setEditingUser(null);
//     setFormData({ fullName: "", email: "", password: "", role: "Student", classId: "" });
//     setFormError("");
//     setModalOpen(true);
//   }

//   function openEdit(user: User) {
//     setEditingUser(user);
//     setFormData({
//       fullName: user.fullName,
//       email: user.email,
//       password: "",
//       role: user.role,
//       classId: user.classId ?? "",
//     });
//     setFormError("");
//     setModalOpen(true);
//   }

//   async function handleSave() {
//     setFormError("");
//     if (!formData.fullName.trim() || !formData.email.trim()) {
//       setFormError("Full Name and Email are required.");
//       return;
//     }
//     if (!editingUser && !formData.password) {
//       setFormError("Password is required for new users.");
//       return;
//     }
//     setSaving(true);
//     try {
//       if (editingUser) {
//         const payload: UpdateUserPayload = {
//           fullName: formData.fullName,
//           email: formData.email,
//           role: formData.role,
//           classId: formData.role === "Student" ? formData.classId || null : null,
//         };
//         await api.put(`/users/${editingUser.id}`, payload);
//       } else {
//         const payload: CreateUserPayload = {
//           fullName: formData.fullName,
//           email: formData.email,
//           password: formData.password,
//           role: formData.role,
//           classId: formData.role === "Student" ? formData.classId || null : null,
//         };
//         await api.post("/auth/register", payload);
//       }
//       setModalOpen(false);
//       fetchUsers();
//     } catch (err) {
//       setFormError(getErrorMessage(err));
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(id: string, name: string) {
//     if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
//     try {
//       await api.delete(`/users/${id}`);
//       fetchUsers();
//     } catch (err) {
//       alert(getErrorMessage(err));
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
//           <p className="text-sm text-slate-500">Create, edit, and manage system users.</p>
//         </div>
//         <Button onClick={openCreate}>
//           <Plus className="mr-1.5 h-4 w-4" /> Add User
//         </Button>
//       </div>

//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="relative flex-1 min-w-[200px]">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//               <input
//                 className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
//                 placeholder="Search by name, ID or email..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//               {search && (
//                 <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setSearch("")}>
//                   <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>
//             <Select
//               value={roleFilter}
//               onChange={(e) => setRoleFilter(e.target.value)}
//               className="w-36"
//             >
//               <option value="">All Roles</option>
//               <option value="Admin">Admin</option>
//               <option value="Teacher">Teacher</option>
//               <option value="Student">Student</option>
//             </Select>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           {loading ? (
//             <div className="flex items-center justify-center py-16">
//               <Spinner className="h-8 w-8" />
//             </div>
//           ) : error ? (
//             <div className="p-6 text-sm text-red-600">{error}</div>
//           ) : filtered.length === 0 ? (
//             <div className="p-6 text-center text-sm text-slate-500">No users found.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
//                     <th className="px-4 py-3">Login ID</th>
//                     <th className="px-4 py-3">Full Name</th>
//                     <th className="px-4 py-3">Email</th>
//                     <th className="px-4 py-3">Role</th>
//                     <th className="px-4 py-3">Class</th>
//                     <th className="px-4 py-3">Created</th>
//                     <th className="px-4 py-3 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filtered.map((u) => (
//                     <tr key={u.id} className="hover:bg-slate-50">
//                       <td className="px-4 py-3 font-medium text-slate-900">{u.loginId}</td>
//                       <td className="px-4 py-3 text-slate-700">{u.fullName}</td>
//                       <td className="px-4 py-3 text-slate-500">{u.email}</td>
//                       <td className="px-4 py-3">
//                         <Badge variant={roleColors[u.role] as any}>{u.role}</Badge>
//                       </td>
//                       <td className="px-4 py-3 text-slate-500">{u.className ?? "—"}</td>
//                       <td className="px-4 py-3 text-slate-500">
//                         {new Date(u.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-4 py-3 text-right">
//                         <div className="flex items-center justify-end gap-1">
//                           <button
//                             onClick={() => openEdit(u)}
//                             className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
//                             title="Edit"
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(u.id, u.fullName)}
//                             className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
//                             title="Delete"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Create / Edit Modal */}
//       <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Edit User" : "Create User"}>
//         <div className="space-y-4">
//           {formError && (
//             <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {formError}
//             </div>
//           )}
//           <div>
//             <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
//             <Input
//               value={formData.fullName}
//               onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//               placeholder="e.g. John Doe"
//             />
//           </div>
//           <div>
//             <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
//             <Input
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               placeholder="e.g. john@example.com"
//             />
//           </div>
//           {!editingUser && (
//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
//               <Input
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 placeholder="Min 6 characters"
//               />
//             </div>
//           )}
//           <div>
//             <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
//             <Select
//               value={formData.role}
//               onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
//             >
//               <option value="Admin">Admin</option>
//               <option value="Teacher">Teacher</option>
//               <option value="Student">Student</option>
//             </Select>
//           </div>
//           {formData.role === "Student" && (
//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
//               <Input
//                 value={formData.classId}
//                 onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
//                 placeholder="Class ID (UUID)"
//               />
//               <p className="mt-1 text-xs text-slate-400">Enter the Class ID. Create a class first if needed.</p>
//             </div>
//           )}
//           <div className="flex justify-end gap-3 pt-2">
//             <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
//             <Button onClick={handleSave} loading={saving}>
//               {editingUser ? "Update" : "Create"}
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Search, X, Eye, ShieldCheck, GraduationCap, UserSquare2 } from "lucide-react";
import type { User, Role, CreateUserPayload, UpdateUserPayload, ClassItem } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

const roleColors: Record<Role, string> = {
  Admin: "purple",
  Teacher: "green",
  Student: "blue",
};

const roleTabs: { label: string; value: Role | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Teachers", value: "Teacher" },
  { label: "Students", value: "Student" },
  { label: "Admins", value: "Admin" },
];

type FormState = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  classId: string;
};

const emptyForm: FormState = { fullName: "", email: "", password: "", role: "Student", classId: "" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Role | "All">("All");

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Details modal
  const [detailsUser, setDetailsUser] = useState<User | null>(null);

  // Just-created credentials (shown once — password is hashed server-side after this)
  const [createdCreds, setCreatedCreds] = useState<{ loginId: string; password: string; fullName: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get<ClassItem[]>("/classes");
      setClasses(res.data ?? []);
    } catch {
      // non-fatal — class dropdown just stays empty
    }
  }, []);

  useEffect(() => { fetchUsers(); fetchClasses(); }, [fetchUsers, fetchClasses]);

  const filtered = users.filter((u) => {
    if (activeTab !== "All" && u.role !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.loginId.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const counts = {
    All: users.length,
    Teacher: users.filter((u) => u.role === "Teacher").length,
    Student: users.filter((u) => u.role === "Student").length,
    Admin: users.filter((u) => u.role === "Admin").length,
  };

  function openCreate(role: Role) {
    setEditingUser(null);
    setFormData({ ...emptyForm, role });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      classId: user.classId ?? "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError("");
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError("Full Name and Email are required.");
      return;
    }
    if (formData.role === "Student" && !formData.classId) {
      setFormError("Please select a class for the student.");
      return;
    }
    if (!editingUser && !formData.password) {
      setFormError("Password is required for new users.");
      return;
    }
    if (!editingUser && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const payload: UpdateUserPayload = {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          classId: formData.role === "Student" ? formData.classId || null : null,
        };
        await api.put(`/users/${editingUser.id}`, payload);
        setModalOpen(false);
      } else {
        const payload: CreateUserPayload = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          classId: formData.role === "Student" ? formData.classId || null : null,
        };
        const res = await api.post<{ loginId: string }>("/auth/register", payload);
        setModalOpen(false);
        // Show the login ID + password once — it can't be retrieved later since it's hashed.
        setCreatedCreds({
          loginId: res.data.loginId,
          password: formData.password,
          fullName: formData.fullName,
        });
      }
      fetchUsers();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-sm text-slate-500">Create and manage Teacher, Student and Admin accounts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openCreate("Teacher")}>
            <UserSquare2 className="mr-1.5 h-4 w-4" /> Create Teacher
          </Button>
          <Button variant="outline" onClick={() => openCreate("Student")}>
            <GraduationCap className="mr-1.5 h-4 w-4" /> Create Student
          </Button>
          <Button onClick={() => openCreate("Admin")}>
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Create Admin
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {roleTabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === t.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label} <span className="text-xs text-slate-400">({counts[t.value]})</span>
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search by name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setSearch("")}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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
            <div className="p-6 text-center text-sm text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="px-4 py-3">Login ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.loginId}</td>
                      <td className="px-4 py-3 text-slate-700">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={roleColors[u.role] as any}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{u.className ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailsUser(u)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.fullName)}
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit ${editingUser.role}` : `Create ${formData.role} Account`}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. john@example.com"
            />
          </div>
          {!editingUser && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
              />
              <p className="mt-1 text-xs text-slate-400">
                A Login ID is auto-generated. Save this password — it can't be viewed again after creation.
              </p>
            </div>
          )}
          {!editingUser && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Account Type</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role, classId: "" })}
              >
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
              </Select>
            </div>
          )}
          {formData.role === "Student" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
              <Select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              >
                <option value="">Select a class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.section ? ` - ${c.section}` : ""}
                  </option>
                ))}
              </Select>
              {classes.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No classes exist yet — create a class first.</p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Just-created credentials modal */}
      <Modal open={!!createdCreds} onClose={() => setCreatedCreds(null)} title="Account Created">
        {createdCreds && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {createdCreds.fullName}'s account was created. Share these credentials now — the password cannot be retrieved after you close this window.
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Login ID</span><span className="font-mono font-semibold text-slate-900">{createdCreds.loginId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Password</span><span className="font-mono font-semibold text-slate-900">{createdCreds.password}</span></div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCreatedCreds(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Details modal */}
      <Modal open={!!detailsUser} onClose={() => setDetailsUser(null)} title="User Details">
        {detailsUser && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-2"><span className="text-slate-500">Login ID</span><span className="font-medium text-slate-900">{detailsUser.loginId}</span></div>
            <div className="flex justify-between border-b border-slate-100 py-2"><span className="text-slate-500">Full Name</span><span className="font-medium text-slate-900">{detailsUser.fullName}</span></div>
            <div className="flex justify-between border-b border-slate-100 py-2"><span className="text-slate-500">Email</span><span className="font-medium text-slate-900">{detailsUser.email}</span></div>
            <div className="flex justify-between border-b border-slate-100 py-2"><span className="text-slate-500">Role</span><Badge variant={roleColors[detailsUser.role] as any}>{detailsUser.role}</Badge></div>
            {detailsUser.role === "Student" && (
              <div className="flex justify-between border-b border-slate-100 py-2"><span className="text-slate-500">Class</span><span className="font-medium text-slate-900">{detailsUser.className ?? "—"}</span></div>
            )}
            <div className="flex justify-between py-2"><span className="text-slate-500">Created</span><span className="font-medium text-slate-900">{new Date(detailsUser.createdAt).toLocaleString()}</span></div>
            <p className="pt-2 text-xs text-slate-400">Passwords are encrypted and can't be displayed after creation. Use "Edit" or a password-reset flow if the user is locked out.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}