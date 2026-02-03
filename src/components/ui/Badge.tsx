import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#00B900] text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,185,0,0.3)] [a&]:hover:-translate-y-0.5 [a&]:hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,185,0,0.4)]",
        secondary:
          "bg-white text-gray-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.06)] [a&]:hover:-translate-y-0.5 [a&]:hover:bg-[#e8f5e9] [a&]:hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.1)]",
        destructive:
          "bg-red-500 text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(239,68,68,0.3)] [a&]:hover:-translate-y-0.5 [a&]:hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(239,68,68,0.4)]",
        outline:
          "bg-transparent text-gray-700 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.04)] [a&]:hover:bg-[#e8f5e9]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
