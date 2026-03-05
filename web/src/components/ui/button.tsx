import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "default" | "outline" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
          size === "icon" && "h-8 w-8",
          size === "sm" && "h-8 px-3",
          size === "lg" && "h-10 px-8",
          size === "default" && "h-9 px-4 py-2",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
