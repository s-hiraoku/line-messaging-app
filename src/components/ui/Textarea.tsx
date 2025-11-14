import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "cursor-text min-h-16 w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black transition-all outline-none",
        "placeholder:text-black/40",
        "focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
        "aria-invalid:border-red-600 aria-invalid:bg-red-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
