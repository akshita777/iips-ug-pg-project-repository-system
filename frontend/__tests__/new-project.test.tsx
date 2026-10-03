import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import NewProjectPage from "@/app/(dashboard)/student/projects/new/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({ default: { post: vi.fn() } }));

describe("NewProjectPage", () => {
  it("requires a title", () => {
    render(<NewProjectPage />);
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
  });
});
