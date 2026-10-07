import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"

// Restyled to the Figma page-level Tab (Profile_tabs, 291:19217): Label/M,
// muted when inactive, a 2px red indicator under the active one. Radix keeps
// the behaviour — arrow keys, focus and the tab/tabpanel ARIA wiring.

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List data-slot="tabs-list" className={cn("flex items-center gap-8", className)} {...props} />
  )
}

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group/tab flex cursor-pointer flex-col items-stretch gap-3.5 type-label-m text-muted-foreground outline-none transition-colors",
        // No hover state in Figma; keyboard focus still needs to be visible.
        "focus-visible:text-foreground data-[state=active]:text-foreground",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 px-0.5">{children}</span>
      {/* Indicator: rounded on top only, red when active. */}
      <span className="h-0.5 rounded-t-[2px] transition-colors group-data-[state=active]/tab:bg-primary" />
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
