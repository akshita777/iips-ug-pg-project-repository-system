"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type AppNotification } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
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
      <PageBand
        kicker="Inbox"
        title="Notifications"
        lead="Status changes, allocation news, and evaluation updates."
        crumbs={[{ label: "Notifications" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
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
                <div key={n.id} className={`card ${n.read ? "" : "bg-blue-soft/40"}`}>
                  <p className="font-bold m-0">{n.title || "Update"}</p>
                  <p className="mt-1 text-sm muted">{n.message || "No details."}</p>
                  {!n.read && (
                    <Button variant="white" size="sm" type="button" onClick={() => markRead(n.id)} className="mt-2">
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
