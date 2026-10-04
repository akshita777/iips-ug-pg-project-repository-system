"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type UserRow, type Role } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const roles: Role[] = ["STUDENT", "FACULTY", "COORDINATOR", "EVALUATOR", "ADMIN"];

export default function UsersPage() {
  const { push } = useToast();
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [summary, setSummary] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    Promise.all([
      api.get<UserRow[]>("/users"),
      api.get<Record<string, unknown>>("/analytics/summary").catch(() => ({ data: null })),
    ])
      .then(([u, s]) => {
        setUsers(u.data);
        setSummary(s.data);
      })
      .catch((e) => setError(apiErrorMessage(e, "Could not load users.")))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(id: number, role: Role) {
    try {
      const { data } = await api.patch<UserRow>(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
      push(`Role set to ${role}.`, "success");
    } catch (e) {
      push(apiErrorMessage(e, "Role change failed."), "danger");
    }
  }

  return (
    <Protected allowed={["ADMIN"]}>
      <PageBand
        kicker="Administration"
        title="Users and system"
        lead="Manage accounts, assign roles, view department summary."
        crumbs={[{ label: "Users" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}

          {summary && (
            <Card>
              <CardTitle>Department summary</CardTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th className="n">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary).map(([key, value]) => (
                    <tr key={key}>
                      <td className="font-bold capitalize">{key.replace(/([A-Z])/g, " $1")}</td>
                      <td className="font-mono text-xs n break-all">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}

          {loading ? (
            <div className="card">
              <TableSkeleton rows={4} />
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users" desc="Registered accounts appear here." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-bold">{u.name}</td>
                    <td className="font-mono text-xs">{u.email}</td>
                    <td>
                      <span className="chip bg-navy text-white">{u.role}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {roles
                          .filter((r) => r !== u.role)
                          .map((r) => (
                            <Button key={r} variant="white" size="sm" type="button" onClick={() => changeRole(u.id, r)}>
                              {r}
                            </Button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </Protected>
  );
}
