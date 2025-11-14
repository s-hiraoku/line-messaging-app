import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-2 border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#00B900] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] [a&]:hover:translate-x-[1px] [a&]:hover:translate-y-[1px] [a&]:hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
        secondary:
          "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] [a&]:hover:translate-x-[1px] [a&]:hover:translate-y-[1px] [a&]:hover:bg-[#FFFEF5] [a&]:hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
        destructive:
          "bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] [a&]:hover:translate-x-[1px] [a&]:hover:translate-y-[1px] [a&]:hover:bg-red-700 [a&]:hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
        outline:
          "bg-transparent text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] [a&]:hover:bg-[#FFFEF5]",
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
