import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "accent" | "dark" | "white" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary text-ink",
  secondary: "bg-secondary text-ink",
  accent: "bg-accent text-ink",
  dark: "bg-ink text-white",
  white: "bg-white text-ink",
  success: "bg-success text-ink",
  danger: "bg-danger text-ink",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("brutal-btn", variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}
