import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.ComponentProps<"input">

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "cursor-text h-10 w-full min-w-0 rounded-xl bg-white px-3 py-2 font-mono text-sm text-gray-800 transition-all duration-300 outline-none",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]",
        "placeholder:text-gray-400",
        "focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,185,0,0.15)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-800",
        "aria-invalid:shadow-[inset_0_2px_4px_rgba(239,68,68,0.1),0_2px_8px_rgba(239,68,68,0.2)] aria-invalid:bg-red-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
