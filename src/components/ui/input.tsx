import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#172033]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#172033] placeholder:text-[#667085] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2457D6]/30 focus:border-[#2457D6]",
            error
              ? "border-[#C43D4B] focus:border-[#C43D4B] focus:ring-[#C43D4B]/20"
              : "border-[#E4E9F2]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[#C43D4B]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#667085]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
