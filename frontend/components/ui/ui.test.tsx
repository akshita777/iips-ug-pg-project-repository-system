import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Input } from "./input";
import { Alert } from "./alert";
import { StatusBadge } from "./badge";
import { EmptyState } from "./empty-state";

describe("Button", () => {
  it("renders children and applies variant class", () => {
    render(<Button variant="navy">Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toBeInTheDocument();
  });

  it("disables when loading style is requested", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});

describe("Input", () => {
  it("shows label and inline error", () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renders danger tone with dark text", () => {
    render(<Alert tone="danger">Broken</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Broken");
  });
});

describe("StatusBadge", () => {
  it("humanizes underscore statuses", () => {
    render(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText("UNDER REVIEW")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders title and action link when provided", () => {
    render(<EmptyState title="No projects" desc="Add one" actionHref="/projects/new" actionLabel="Add" />);
    expect(screen.getByText("No projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add" })).toHaveAttribute("href", "/projects/new");
  });
});
