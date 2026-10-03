import { render, screen, waitFor } from "@testing-library/react";
import { vi, beforeEach } from "vitest";
import StudentDashboard from "@/app/(dashboard)/student/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: [
          { id: 1, title: "Smart Attendance", status: "DRAFT", techStack: "Next.js" },
        ],
      })
    ),
    post: vi.fn(() => Promise.resolve({})),
  },
}));

describe("StudentDashboard", () => {
  beforeEach(() => localStorage.setItem("token", "test"));
  it("shows the semester progress tracker", () => {
    render(<StudentDashboard />);
    expect(screen.getByText("Sem 1")).toBeInTheDocument();
    expect(screen.getByText("Sem 10")).toBeInTheDocument();
  });

  it("lists projects from the API", async () => {
    render(<StudentDashboard />);
    await waitFor(() =>
      expect(screen.getByText("Smart Attendance")).toBeInTheDocument()
    );
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
  });
});
