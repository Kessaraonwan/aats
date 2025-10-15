import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-primary/10 text-primary [a&]:hover:bg-primary/20",
        secondary:
          "border-0 bg-secondary/10 text-secondary [a&]:hover:bg-secondary/20",
        destructive:
          "border-0 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20",
        outline:
          "border border-input bg-background text-foreground [a&]:hover:bg-accent",
        engineering:
          "border-0 bg-blue-50 text-blue-700 [a&]:hover:bg-blue-100",
        design:
          "border-0 bg-purple-50 text-purple-700 [a&]:hover:bg-purple-100",
        product:
          "border-0 bg-green-50 text-green-700 [a&]:hover:bg-green-100",
        data:
          "border-0 bg-amber-50 text-amber-700 [a&]:hover:bg-amber-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
