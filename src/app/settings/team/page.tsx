"use client";

import { useState } from "react";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { Users, Shield, UserPlus } from "lucide-react";

// MOCK data for the UI representation since we just need the UI for the RBAC assignments
export default function TeamSettingsPage() {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Admin TVV", email: "admin@tvv.com", role: "Super Admin" },
    { id: 2, name: "Sales Agent 1", email: "sales@tvv.com", role: "Sales" },
    { id: 3, name: "Marketing Lead", email: "marketing@tvv.com", role: "Marketing" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Sales");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setEmployees([...employees, { id: Date.now(), name: "Pending Invite", email: newEmail, role: newRole }]);
    setNewEmail("");
    setIsAdding(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team & Permissions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employee accounts and their role-based access.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          Invite Employee
        </button>
      </div>

      {isAdding && (
        <div className="bg-card border border-border rounded-lg p-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-lg mb-4">Invite new employee</h3>
          <form onSubmit={handleInvite} className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                placeholder="employee@tvv.com"
              />
            </div>
            <div className="w-48 space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium">
              Send Invite
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Employee</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {emp.role === "Super Admin" ? (
                      <Shield className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Users className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="font-medium">{emp.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-blue-600 hover:underline">Edit Role</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
