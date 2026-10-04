import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "dark"
  | "white"
  | "success"
  | "danger"
  | "warn"
  | "lilac"
  | "navy"
  | "amber"
  | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "btn",
  navy: "btn",
  dark: "btn",
  amber: "btn btn-amber",
  secondary: "btn bg-blue-soft border-blue-soft text-navy",
  accent: "btn btn-outline",
  white: "btn btn-outline",
  success: "btn bg-good-soft border-good-soft text-good",
  danger: "btn bg-bad-soft border-bad-soft text-bad",
  warn: "btn bg-warn-soft border-warn-soft text-warn",
  lilac: "btn bg-band border-line text-ink",
  outline: "btn btn-outline",
};

const sizeStyles: Record<Size, string> = {
  sm: "btn-small",
  md: "",
  lg: "min-h-[52px] px-7 text-[1rem]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(variantStyles[variant], sizeStyles[size], className)} {...props} />;
}
