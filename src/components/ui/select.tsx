"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
  placeholder?: string
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  onSelect?: () => void
}

interface SelectValueProps {
  placeholder?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, disabled }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className={cn(!value && "text-gray-500 dark:text-gray-400")}>
      {value || placeholder}
    </span>
  )
}

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { open, setOpen } = React.useContext(SelectContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
    >
      <div className="max-h-60 overflow-auto p-1">
        {children}
      </div>
    </div>
  )
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, onSelect }) => {
  const { onValueChange, setOpen } = React.useContext(SelectContext)
  
  const handleSelect = () => {
    onValueChange?.(value)
    setOpen(false)
    onSelect?.()
  }
  
  return (
    <div
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
      onClick={handleSelect}
    >
      {children}
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }