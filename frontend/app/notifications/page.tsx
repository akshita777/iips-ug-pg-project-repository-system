"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type AppNotification } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { push } = useToast();
  const [items, setItems] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<AppNotification[]>("/notifications")
      .then((res) => setItems(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Could not load notifications.")))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: number) {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      push(apiErrorMessage(e, "Mark read failed."), "danger");
    }
  }

  return (
    <Protected>
      <div className="space-y-5">
        <div className="brutal-card bg-primary p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-black">Notifications</h1>
          <p className="mt-1 text-sm text-white">Status changes, allocation news, and evaluation updates.</p>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-16 w-full" />
          </div>
        ) : items.length === 0 && !error ? (
          <EmptyState title="All caught up" desc="No notifications yet." />
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className={`brutal-card p-4 ${n.read ? "bg-white" : "bg-accent"}`}>
                <p className="font-display font-bold">{n.title || "Update"}</p>
                <p className="mt-1 text-sm text-ink/70">{n.message || "No details."}</p>
                {!n.read && (
                  <Button variant="white" size="sm" type="button" onClick={() => markRead(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Protected>
  );
}
