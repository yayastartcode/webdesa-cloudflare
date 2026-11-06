"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  onClick?: () => void
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(open)
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    setInternalOpen(newOpen)
    onOpenChange?.(newOpen)
  }, [onOpenChange])
  
  React.useEffect(() => {
    setInternalOpen(open)
  }, [open])
  
  return (
    <DialogContext.Provider value={{ open: internalOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, onClick }) => {
  const { setOpen } = React.useContext(DialogContext)
  
  const handleClick = () => {
    setOpen(true)
    onClick?.()
  }
  
  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => {
  const { open, setOpen } = React.useContext(DialogContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, setOpen])
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />
      
      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          "relative z-50 w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg",
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:ring-offset-gray-800 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        {children}
      </div>
    </div>
  )
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, children }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0", className)}>
      {children}
    </div>
  )
}

const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-black dark:text-white", className)}>
      {children}
    </h3>
  )
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ className, children }) => {
  return (
    <p className={cn("text-sm text-gray-600 dark:text-gray-300", className)}>
      {children}
    </p>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}