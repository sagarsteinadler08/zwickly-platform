import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 px-4 py-3 text-base text-slate-800 dark:text-white ring-offset-background placeholder:text-slate-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
