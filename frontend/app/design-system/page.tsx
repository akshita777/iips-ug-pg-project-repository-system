import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Grade } from "@/components/ui/grade";
import { Meter } from "@/components/ui/meter";
import { PageBand } from "@/components/layout/page-band";

export const metadata: Metadata = {
  title: "Design System | IIPS Project Portal",
  description: "Institutional tokens and primitives preview",
};

const swatches: [string, string, string][] = [
  ["navy", "#004b76", "bg-navy text-white"],
  ["navy deep", "#00395a", "bg-navy-deep text-white"],
  ["blue", "#00629b", "bg-blue text-white"],
  ["blue soft", "#e6f0f7", "bg-blue-soft text-navy"],
  ["amber", "#b45309", "bg-amber text-white"],
  ["cream", "#fffbeb", "bg-cream text-amber-text"],
  ["ink", "#1e293b", "bg-ink text-white"],
  ["muted", "#526070", "bg-muted text-white"],
  ["good", "#166534", "bg-good text-white"],
  ["good soft", "#dcfce7", "bg-good-soft text-good"],
  ["warn", "#92400e", "bg-warn text-white"],
  ["warn soft", "#fef3c7", "bg-warn-soft text-warn"],
  ["bad", "#991b1b", "bg-bad text-white"],
  ["bad soft", "#fee2e2", "bg-bad-soft text-bad"],
];

export default function DesignSystemPage() {
  return (
    <>
      <PageBand
        kicker="Design system"
        title="Institutional tokens and primitives"
        lead="Navy authority, IEEE blue actions, amber highlights. Every pair below passes WCAG AA."
        crumbs={[{ label: "Design system" }]}
      />
      <div className="section">
        <div className="wrap space-y-8">
          <section>
            <div className="section-head">
              <h2>Palette</h2>
              <p className="lead">Monochromatic blue ramp for trust, one warm amber complement, slate neutrals.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {swatches.map(([label, hex, bg]) => (
                <div key={label} className={`border border-line rounded-card p-3 ${bg}`}>
                  <p className="font-bold text-sm capitalize m-0">{label}</p>
                  <p className="font-mono text-xs uppercase m-0">{hex}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-2">
            <Card>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>44px targets, uppercase labels, navy lead with amber CTA.</CardDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="amber" size="sm">Amber CTA</Button>
                <Button variant="success" size="sm">Success</Button>
                <Button variant="warn" size="sm">Warning</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </div>
            </Card>
            <Card>
              <CardTitle>Status chips and grades</CardTitle>
              <CardDescription>Dark text on soft fills, never color alone.</CardDescription>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <StatusBadge status="SUBMITTED" />
                <StatusBadge status="UNDER_REVIEW" />
                <StatusBadge status="APPROVED" />
                <StatusBadge status="REJECTED" />
                <Grade marks={85} />
                <Grade marks={62} />
                <Grade marks={null} />
              </div>
              <div className="mt-3 space-y-2">
                <Alert tone="info">Info: submission received.</Alert>
                <Alert tone="danger">Error text names the problem and the recovery.</Alert>
              </div>
            </Card>
          </section>

          <section className="grid grid-2">
            <Card>
              <CardTitle>Meters</CardTitle>
              <Meter
                pillars={[
                  { id: "a", label: "Submissions", points: 24, max: 30 },
                  { id: "b", label: "Evaluated", points: 18, max: 30 },
                ]}
              />
            </Card>
            <Card>
              <CardTitle>Team and input</CardTitle>
              <div className="mt-3 flex items-center gap-2">
                <Avatar name="Aarav Sharma" index={0} />
                <Avatar name="Diya Patel" index={1} />
                <Avatar name="Kabir Singh" index={2} />
                <span className="text-sm font-semibold">Initials with soft fills</span>
              </div>
              <div className="mt-3">
                <Input label="Project title" placeholder="Smart attendance system" />
              </div>
            </Card>
          </section>

          <Table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Hex</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">navy</td>
                <td className="font-mono text-xs">#004b76</td>
                <td>headings, navbar active, primary buttons</td>
              </tr>
              <tr>
                <td className="font-bold">blue</td>
                <td className="font-mono text-xs">#00629b</td>
                <td>links, meters, navbar</td>
              </tr>
              <tr>
                <td className="font-bold">amber</td>
                <td className="font-mono text-xs">#b45309</td>
                <td>CTA, notice text, focus ring</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
}
