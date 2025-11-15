"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ZKShieldIconProps {
  className?: string
  animate?: boolean
}

export function ZKShieldIcon({ className, animate = false }: ZKShieldIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "w-8 h-8",
        animate && "animate-pulse",
        className
      )}
    >
      {/* Shield outline */}
      <path
        d="M50 10 L80 25 L80 50 Q80 75 50 90 Q20 75 20 50 L20 25 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-primary"
      />

      {/* Inner glow */}
      <path
        d="M50 15 L75 27 L75 50 Q75 72 50 85 Q25 72 25 50 L25 27 Z"
        fill="currentColor"
        className="text-primary/20"
      />

      {/* ZK Text */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        className="text-primary font-bold"
        style={{ fontSize: "20px", fontFamily: "monospace" }}
      >
        ZK
      </text>

      {/* Lock symbol */}
      <circle
        cx="50"
        cy="40"
        r="3"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  )
}
