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
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-blue-600" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-green-200 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:border-green-900",
          error: "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:border-red-900",
          warning: "group-[.toaster]:border-yellow-200 group-[.toaster]:bg-yellow-50 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:border-yellow-900",
          info: "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:border-blue-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
