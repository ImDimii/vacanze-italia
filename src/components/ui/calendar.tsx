"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

/**
 * ABSOLUTE SAFETY LAYER: Prevents [object Date] rendering errors.
 */
function safeRender(value: any): React.ReactNode {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getDate().toString();
  if (Array.isArray(value)) return value.map((v, i) => <React.Fragment key={i}>{safeRender(v)}</React.Fragment>);
  if (typeof value === "object") {
    if ("toDateString" in value) return (value as Date).getDate().toString();
    if (React.isValidElement(value)) return value;
    return "[Object]";
  }
  return value.toString();
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-start",
        month: "space-y-4 w-full sm:w-auto",
        month_caption: "flex justify-center items-center h-10 mb-4 relative",
        caption_label: "text-xs font-bold text-white uppercase tracking-[0.2em] whitespace-nowrap",
        nav: "absolute top-0 right-0 left-0 flex items-center justify-between z-40 pointer-events-none",
        button_previous: cn(buttonVariants({ variant: "outline" }), "pointer-events-auto h-8 w-8 p-0 rounded-lg hover:bg-white/10 border-border/40 bg-bg-surface/50 flex items-center justify-center transition-all"),
        button_next: cn(buttonVariants({ variant: "outline" }), "pointer-events-auto h-8 w-8 p-0 rounded-lg hover:bg-white/10 border-border/40 bg-bg-surface/50 flex items-center justify-center transition-all"),
        month_grid: "w-full border-collapse table-fixed",
        weekdays: "border-b border-border/10",
        weekday: "text-[9px] font-bold text-text-secondary uppercase tracking-widest text-center pt-2 pb-3",
        week: "mt-1",
        day: "p-0 relative h-10",
        selected: "!bg-accent-gold !text-black rounded-xl",
        today: "text-accent-gold rounded-xl ring-2 ring-accent-gold/30 bg-accent-gold/5",
        outside: "day-outside text-text-secondary/10 opacity-20",
        disabled: "text-text-secondary/10 opacity-10 pointer-events-none",
        range_start: "day-range-start !bg-accent-gold !text-black rounded-l-xl",
        range_end: "day-range-end !bg-accent-gold !text-black rounded-r-xl",
        range_middle: "aria-selected:!bg-accent-gold/20 aria-selected:!text-accent-gold rounded-none border-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => orientation === "left" ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />,
        CaptionLabel: ({ children }) => (
          <span className="text-xs font-bold text-white uppercase tracking-[0.2em] whitespace-nowrap">
            {children}
          </span>
        ),
        DayButton: (props) => {
          const { day, modifiers, className: btnClassName, ...buttonProps } = props;
          if (!day?.date) return <></>;

          const isSelected = modifiers?.selected;
          const isToday = modifiers?.today;
          const isOutside = modifiers?.outside;
          const isRangeStart = modifiers?.range_start;
          const isRangeEnd = modifiers?.range_end;
          const isRangeMiddle = modifiers?.range_middle;

          return (
            <button
              {...buttonProps}
              className={cn(
                "relative flex flex-col items-center justify-center aspect-square w-full rounded-xl transition-all duration-300 border text-[11px] font-bold",
                isSelected 
                  ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/20" 
                  : isToday 
                    ? "bg-accent-gold/10 border-accent-gold/30 text-accent-gold font-black" 
                    : isRangeMiddle
                      ? "bg-accent-gold/20 border-transparent text-accent-gold"
                      : "bg-bg-primary/40 border-border/50 text-white hover:border-accent-gold/40 hover:bg-bg-primary",
                isOutside && "opacity-10 grayscale cursor-not-allowed border-transparent bg-transparent",
              )}
            >
              {day.date.getDate()}
            </button>
          );
        },
        ...props.components,
      }}
      {...props}
    />
  )
}

export { Calendar }
