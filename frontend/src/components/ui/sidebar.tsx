"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
}

type SidebarContextType = {
    expanded: boolean
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function Sidebar({ className, children }: SidebarProps) {
    const [expanded, setExpanded] = React.useState(true)

    return (
        <SidebarContext.Provider value={{ expanded, setExpanded }}>
            <div className={cn("relative", className)}>
                <div
                    className={cn(
                        "fixed left-0 top-0 z-40 h-full w-64 transform bg-background transition-all duration-300 ease-in-out",
                        expanded ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between p-4">
                            <h2 className="text-lg font-semibold">Admin Portal</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setExpanded(false)}
                                className="lg:hidden"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            {children}
                        </ScrollArea>
                    </div>
                </div>
                {!expanded && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="fixed left-0 top-4 z-50"
                        onClick={() => setExpanded(true)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </SidebarContext.Provider>
    )
}

export function SidebarItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(SidebarContext)
    if (!context) throw new Error("SidebarItem must be used within Sidebar")

    return (
        <div
            className={cn(
                "flex items-center rounded-lg px-3 py-2 transition-all hover:bg-accent",
                context.expanded ? "justify-start" : "justify-center",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

