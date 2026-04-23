import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const numericProps =
    type === "number"
      ? {
          inputMode: props.inputMode ?? "numeric",
          pattern: props.pattern ?? "[0-9]*",
        }
      : {};

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 file:text-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...numericProps}
      {...props}
    />
  );
}

export { Input };
