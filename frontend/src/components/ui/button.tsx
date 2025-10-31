import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 shadow-lg shadow-purple-500/30 rounded-full border-0 font-semibold transition-all duration-300",
        primary: "bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 shadow-lg shadow-purple-500/30 rounded-full border-0 font-semibold transition-all duration-300",
        destructive: "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 shadow-lg shadow-red-500/30 rounded-full font-semibold",
        outline: "border-2 border-purple-500/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 rounded-full font-medium transition-all duration-300",
        secondary: "bg-gradient-to-r from-[#48E0E4] to-[#22C55E] text-white hover:shadow-xl hover:scale-105 shadow-lg rounded-full font-semibold",
        ghost: "hover:bg-white/10 text-gray-300 hover:text-white rounded-full transition-all",
        link: "text-[#7B5CFA] underline-offset-4 hover:underline hover:text-[#48E0E4]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-full px-4",
        lg: "h-13 rounded-full px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
