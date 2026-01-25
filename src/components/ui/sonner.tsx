"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'cursor-pointer rounded-xl bg-white text-gray-800 font-mono shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.12)] border-0',
          title: 'text-gray-800 font-bold',
          description: 'text-gray-500',
          actionButton: 'cursor-pointer rounded-lg bg-[#00B900] text-white font-bold shadow-[inset_0_-2px_6px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,185,0,0.3)]',
          cancelButton: 'cursor-pointer rounded-lg bg-white text-gray-700 font-bold shadow-[inset_0_-2px_6px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)]',
          success: 'text-[#00B900]',
          error: 'text-red-500',
          warning: 'text-amber-600',
          info: 'text-blue-500',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#00B900]" />,
        info: <InfoIcon className="size-4 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-gray-500" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
