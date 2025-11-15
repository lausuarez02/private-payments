import React from "react"
import { cn } from "@/lib/utils"

interface BNBLogoProps {
  className?: string
}

export function BNBLogo({ className }: BNBLogoProps) {
  return (
    <svg
      viewBox="0 0 126 126"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <path
        d="M38.171 53.203L62.759 28.616L87.36 53.216L101.667 38.909L62.759 0L23.851 38.909L38.171 53.203Z"
        fill="currentColor"
      />
      <path
        d="M0 62.983L14.32 48.676L28.64 62.983L14.32 77.303L0 62.983Z"
        fill="currentColor"
      />
      <path
        d="M38.171 72.776L62.759 97.363L87.359 72.763L101.679 87.057L101.666 87.07L62.759 126L23.851 87.07L23.838 87.057L38.171 72.776Z"
        fill="currentColor"
      />
      <path
        d="M97.346 62.983L111.666 48.676L125.986 62.983L111.666 77.303L97.346 62.983Z"
        fill="currentColor"
      />
      <path
        d="M77.786 62.996L63.466 48.676L52.799 59.343L51.106 61.036L49.146 62.996L63.466 77.316L77.786 62.996Z"
        fill="currentColor"
      />
    </svg>
  )
}
