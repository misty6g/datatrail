import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg" | "sm";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          variant === "primary" &&
            "bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm hover:brightness-105",
          variant === "secondary" &&
            "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-2)]",
          variant === "ghost" && "bg-transparent text-[var(--ink)] hover:bg-[var(--surface)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";