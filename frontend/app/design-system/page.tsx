import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Design System | IIPS Project Portal",
  description: "Soft pastel neobrutalism tokens and primitives preview",
};

const swatches = [
  ["primary", "#FFE99A", "bg-primary"],
  ["secondary rose", "#FFC7E3", "bg-secondary"],
  ["accent sky", "#BEE6FF", "bg-accent"],
  ["success mint", "#BEF2C9", "bg-success"],
  ["warn peach", "#FFD3AC", "bg-warn"],
  ["lilac", "#D8CCFF", "bg-lilac"],
  ["danger blush", "#FFC9C9", "bg-danger"],
  ["muted sand", "#F4EFE6", "bg-muted"],
];

export default function DesignSystemPage() {
  return (
    <div className="space-y-8">
      <section className="brutal-card bg-primary p-6 md:p-8">
        <span className="brutal-badge bg-white">Tokens first</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-black">Soft pastel system</h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base">
          Warm analogous fills with cool complements. Same lightness band, ink borders, hard shadows.
          Ink text on every fill. Danger text uses dark red for contrast.
        </p>
      </section>

      <section className="brutal-card bg-white p-6">
        <CardTitle>Palette</CardTitle>
        <CardDescription>Paper #FFFEF9 plus ink #1C1B1A. Fills share lightness 85 to 90 percent.</CardDescription>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map(([label, hex, bg]) => (
            <div key={label} className={`border-2 border-ink rounded-lg p-3 ${bg}`}>
              <p className="font-display text-sm font-black capitalize">{label}</p>
              <p className="font-mono text-xs uppercase">{hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="bg-white">
          <CardTitle>Buttons</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" size="sm">Primary</Button>
            <Button variant="secondary" size="sm">Rose</Button>
            <Button variant="accent" size="sm">Sky</Button>
            <Button variant="success" size="sm">Mint</Button>
            <Button variant="warn" size="sm">Peach</Button>
            <Button variant="lilac" size="sm">Lilac</Button>
            <Button variant="dark" size="sm">Dark</Button>
            <Button variant="danger" size="sm">Danger</Button>
          </div>
        </Card>
        <Card className="bg-white">
          <CardTitle>Badges and alerts</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status="SUBMITTED" />
            <StatusBadge status="UNDER_REVIEW" />
            <StatusBadge status="APPROVED" />
            <StatusBadge status="REJECTED" />
          </div>
          <div className="mt-3 space-y-2">
            <Alert tone="info">Info: submission received.</Alert>
            <Alert tone="danger">Error text uses dark red on blush.</Alert>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="bg-white">
          <CardTitle>Team</CardTitle>
          <div className="mt-3 flex items-center gap-2">
            <Avatar name="Aarav Sharma" index={0} />
            <Avatar name="Diya Patel" index={1} />
            <Avatar name="Kabir Singh" index={2} />
            <span className="text-sm font-bold">Pastel avatars cycle fills</span>
          </div>
        </Card>
        <Card className="bg-white">
          <CardTitle>Input</CardTitle>
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
            <td className="font-bold">butter</td>
            <td className="font-mono text-xs">#FFE99A</td>
            <td>hero, primary actions</td>
          </tr>
          <tr>
            <td className="font-bold">rose</td>
            <td className="font-mono text-xs">#FFC7E3</td>
            <td>coordinator, highlights</td>
          </tr>
          <tr>
            <td className="font-bold">sky</td>
            <td className="font-mono text-xs">#BEE6FF</td>
            <td>info, focus rings</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
