import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.ComponentProps<"input">

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "cursor-text h-10 w-full min-w-0 border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black transition-all outline-none",
        "placeholder:text-black/40",
        "focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-black",
        "aria-invalid:border-red-600 aria-invalid:bg-red-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
