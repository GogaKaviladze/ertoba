"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps {
  className?: string
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number[]) => void
  [key: string]: unknown
}

export function Slider({
  className,
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  ...props
}: SliderProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<number>(
    () => (defaultValue && defaultValue.length > 0 ? defaultValue[0] : min)
  )

  const currentValue = isControlled && value && value.length > 0 ? value[0] : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (!isControlled) {
      setInternalValue(val)
    }
    onValueChange?.([val])
  }

  const percentage = Math.max(0, Math.min(100, ((currentValue - min) / (max - min || 1)) * 100))

  return (
    <div
      className={cn(
        "relative flex w-full touch-none items-center select-none py-3",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Slider Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Slider Thumb Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 rounded-full bg-white border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] transition-all pointer-events-none"
        style={{ left: `${percentage}%` }}
      />

      {/* Native Range Input for full accessibility and touch handling */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 size-full opacity-0 cursor-pointer z-10"
      />
    </div>
  )
}
