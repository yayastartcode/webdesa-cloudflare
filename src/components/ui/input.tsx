import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-black dark:file:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 selection:bg-blue-600 selection:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-blue-600 focus-visible:ring-blue-600/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-600/20 dark:aria-invalid:ring-red-400/40 aria-invalid:border-red-600 dark:aria-invalid:border-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
