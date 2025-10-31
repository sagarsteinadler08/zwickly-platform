import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl bg-white dark:bg-white/10 backdrop-blur-sm border-2 border-slate-300 dark:border-white/20 px-4 py-3 text-base text-slate-800 dark:text-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-800 dark:file:text-white placeholder:text-slate-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 focus-visible:bg-slate-50 dark:focus-visible:bg-white/15 hover:bg-slate-50 dark:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
