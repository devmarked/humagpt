"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface RightDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

const RightDrawer = React.forwardRef<HTMLDivElement, RightDrawerProps>(
  ({ isOpen, onClose, children, title, className }, ref) => {
    return (
      <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
        <SheetContent 
          ref={ref}
          side="right"
          className={cn(
            "w-full max-w-md",
            className
          )}
        >
          {/* Header */}
          <SheetHeader className="flex flex-row items-center justify-between p-4 pr-12 border-b border-gray-200 bg-white sticky top-0 z-50">
            {title && (
              <SheetTitle className="text-lg font-semibold text-gray-900">{title}</SheetTitle>
            )}
          </SheetHeader>
          
          {/* Content with proper scrolling */}
          <div className="h-[calc(100vh-73px)] overflow-y-auto relative z-10">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }
)

RightDrawer.displayName = "RightDrawer"

export { RightDrawer }
