import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.ComponentProps<"textarea">

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "cursor-text min-h-16 w-full rounded-xl bg-white px-3 py-2 font-mono text-sm text-gray-800 transition-all duration-300 outline-none",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]",
        "placeholder:text-gray-400",
        "focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,185,0,0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
        "aria-invalid:shadow-[inset_0_2px_4px_rgba(239,68,68,0.1),0_2px_8px_rgba(239,68,68,0.2)] aria-invalid:bg-red-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
