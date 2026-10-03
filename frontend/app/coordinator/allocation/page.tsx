import type { Metadata } from "next";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Guide allocation | IIPS Project Portal",
  description: "Coordinator view for unallocated students and suggestions",
};

export default function AllocationPage() {
  return (
    <div className="space-y-5">
      <div className="brutal-card bg-lilac p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Guide allocation</h1>
          <p className="mt-1 text-sm text-ink/70">Coordinator only. Suggestions are drafts until confirmed.</p>
        </div>
        <Button variant="dark" size="sm" type="button">
          Run suggestions
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Preferences</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-bold">No rows yet</td>
            <td className="text-ink/70">Connect the backend to list unallocated students.</td>
            <td>
              <span className="brutal-badge bg-warn">Pending</span>
            </td>
          </tr>
        </tbody>
      </Table>
      <EmptyState
        title="Confirm step lives here"
        desc="Draft suggestion rows get per row adjust controls plus a confirm all action."
      />
    </div>
  );
}
