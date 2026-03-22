"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  activeItem: string | null
  setActiveItem: (value: string | null) => void
} | null>(null)

export function Accordion({ 
  children, 
  className,
  type = "single",
  collapsible = true
}: { 
  children: React.ReactNode, 
  className?: string,
  type?: "single",
  collapsible?: boolean
}) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null)

  return (
    <AccordionContext.Provider value={{ activeItem, setActiveItem: (val) => {
      if (collapsible && val === activeItem) {
        setActiveItem(null)
      } else {
        setActiveItem(val)
      }
    } }}>
      <div className={cn("space-y-4", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ 
  children, 
  className,
  value
}: { 
  children: React.ReactNode, 
  className?: string,
  value: string 
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value })
        }
        return child
      })}
    </div>
  )
}

export function AccordionTrigger({ 
  children, 
  className,
  value 
}: { 
  children: React.ReactNode, 
  className?: string,
  value?: string 
}) {
  const context = React.useContext(AccordionContext)
  if (!context) return null

  const isOpen = context.activeItem === value

  return (
    <button
      type="button"
      onClick={() => context.setActiveItem(value!)}
      className={cn(
        "flex w-full items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  )
}

export function AccordionContent({ 
  children, 
  className,
  value 
}: { 
  children: React.ReactNode, 
  className?: string,
  value?: string 
}) {
  const context = React.useContext(AccordionContext)
  if (!context) return null

  const isOpen = context.activeItem === value

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className={cn("pb-4 pt-0", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
