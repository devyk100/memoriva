"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"

interface ColorPickerProps {
  currentColor?: string
  onColorChange: (color: string) => void
  className?: string
}

const predefinedColors = [
  "#FFFFFF", // Black
  "#374151", // Gray-700
  "#DC2626", // Red-600
  "#EA580C", // Orange-600
  "#D97706", // Amber-600
  "#65A30D", // Lime-600
  "#059669", // Emerald-600
  "#0891B2", // Cyan-600
  "#2563EB", // Blue-600
  "#7C3AED", // Violet-600
  "#958DF1", // Current purple
  "#DB2777", // Pink-600
]

export function ColorPicker({ currentColor, onColorChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(currentColor || "#000000")

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    setIsOpen(false)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    onColorChange(color)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className="h-9">
        <Button
          variant="icon-button"
          className={cn("relative", className)}
          size="sm"
        >
          <div 
            className="w-[20px] h-[20px] rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: currentColor || "#958DF1" }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Text Color</h4>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                    currentColor === color 
                      ? "border-gray-900 dark:border-gray-100 shadow-md" 
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <div className="border-t pt-3">
            <label className="text-sm font-medium mb-2 block">Custom Color</label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-20 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    onColorChange(e.target.value)
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-background"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
