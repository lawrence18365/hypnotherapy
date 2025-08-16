"use client"

import * as React from "react"
import { Check } from "lucide-react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div 
          className={`
            w-5 h-5 border-2 border-black rounded flex items-center justify-center cursor-pointer
            ${checked ? 'bg-black border-black' : 'bg-white border-black hover:bg-gray-50'}
            transition-colors duration-200
            ${className}
          `}
          onClick={() => onCheckedChange?.(!checked)}
        >
          {checked && (
            <Check className="w-3 h-3 text-yellow-400" strokeWidth={3} />
          )}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
