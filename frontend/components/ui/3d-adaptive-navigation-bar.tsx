import React, { useState, useRef, useEffect } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Send, History, Wallet } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface NavItem {
  label: string
  icon: React.ElementType
  id: string
  path?: string
}

interface PillBaseProps {
  onWalletClick?: () => void
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion
 */
export const PillBase: React.FC<PillBaseProps> = ({ onWalletClick }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevSectionRef = useRef('dashboard')

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard', path: '/dashboard' },
    { label: 'Send', icon: Send, id: 'send', path: '/dashboard/send' },
    { label: 'History', icon: History, id: 'history', path: '/dashboard/history' },
    { label: 'Wallet', icon: Wallet, id: 'wallet' },
  ]

  // Update active section based on current path
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveSection('dashboard')
    } else if (pathname === '/dashboard/send') {
      setActiveSection('send')
    } else if (pathname === '/dashboard/history') {
      setActiveSection('history')
    }
  }, [pathname])

  // Spring animations for smooth motion
  const pillWidth = useSpring(180, { stiffness: 220, damping: 25, mass: 1 })
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 })

  // No scroll detection - purely click-based navigation

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true)
      pillWidth.set(650)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
        pillWidth.set(180)
      }, 600)
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [hovering, pillWidth])

  const handleMouseEnter = () => {
    setHovering(true)
  }

  const handleMouseLeave = () => {
    setHovering(false)
  }

  const handleSectionClick = (sectionId: string) => {
    // Special handling for wallet click
    if (sectionId === 'wallet' && onWalletClick) {
      onWalletClick()
      setHovering(false)
      return
    }

    // Find the nav item and navigate to its path
    const navItem = navItems.find(item => item.id === sectionId)
    if (navItem?.path) {
      router.push(navItem.path)
    }

    // Trigger transition state
    setIsTransitioning(true)
    prevSectionRef.current = sectionId
    setActiveSection(sectionId)

    // Collapse the pill after selection
    setHovering(false)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const activeItem = navItems.find(item => item.id === activeSection)

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-full"
      style={{
        width: pillWidth,
        height: '56px',
        background: `
          linear-gradient(135deg,
            #0a0a0a 0%,
            #0f0f0f 15%,
            #121212 30%,
            #0d0d0d 45%,
            #0a0a0a 60%,
            #080808 75%,
            #060606 90%,
            #0a0a0a 100%
          )
        `,
        boxShadow: expanded
          ? `
            0 0 20px rgba(0, 255, 100, 0.3),
            0 0 40px rgba(0, 255, 100, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.4),
            0 8px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 1px rgba(0, 255, 100, 0.1),
            inset 0 -1px 2px rgba(0, 0, 0, 0.3)
          `
          : isTransitioning
          ? `
            0 0 15px rgba(0, 255, 100, 0.25),
            0 0 30px rgba(0, 255, 100, 0.15),
            0 3px 6px rgba(0, 0, 0, 0.35),
            0 6px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 1px rgba(0, 255, 100, 0.08),
            inset 0 -1px 2px rgba(0, 0, 0, 0.25)
          `
          : `
            0 0 15px rgba(0, 255, 100, 0.2),
            0 0 30px rgba(0, 255, 100, 0.1),
            0 3px 6px rgba(0, 0, 0, 0.4),
            0 6px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 1px rgba(0, 255, 100, 0.05),
            inset 0 -1px 2px rgba(0, 0, 0, 0.3)
          `,
        x: pillShift,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out',
      }}
    >
      {/* Primary top edge ridge - green glow */}
      <div
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, rgba(0, 255, 100, 0) 0%, rgba(0, 255, 100, 0.4) 5%, rgba(0, 255, 100, 0.6) 15%, rgba(0, 255, 100, 0.6) 85%, rgba(0, 255, 100, 0.4) 95%, rgba(0, 255, 100, 0) 100%)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Top hemisphere light catch */}
      <div
        className="absolute inset-x-0 top-0 rounded-full pointer-events-none"
        style={{
          height: '55%',
          background: 'linear-gradient(180deg, rgba(0, 255, 100, 0.15) 0%, rgba(0, 255, 100, 0.08) 30%, rgba(0, 255, 100, 0.03) 60%, rgba(0, 255, 100, 0) 100%)',
        }}
      />

      {/* Directional light - top left */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 100, 0.12) 0%, rgba(0, 255, 100, 0.06) 20%, rgba(0, 255, 100, 0.02) 40%, rgba(0, 255, 100, 0) 65%)',
        }}
      />

      {/* Premium gloss reflection - main */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: expanded ? '18%' : '15%',
          top: '16%',
          width: expanded ? '140px' : '60px',
          height: '14px',
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 100, 0.3) 0%, rgba(0, 255, 100, 0.15) 40%, rgba(0, 255, 100, 0.05) 70%, rgba(0, 255, 100, 0) 100%)',
          filter: 'blur(4px)',
          transform: 'rotate(-12deg)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Secondary gloss accent - only show when expanded */}
      {expanded && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            right: '22%',
            top: '20%',
            width: '80px',
            height: '10px',
            background: 'radial-gradient(ellipse at center, rgba(0, 255, 100, 0.25) 0%, rgba(0, 255, 100, 0.1) 60%, rgba(0, 255, 100, 0) 100%)',
            filter: 'blur(3px)',
            transform: 'rotate(8deg)',
          }}
        />
      )}

      {/* Left edge illumination - only show when expanded */}
      {expanded && (
        <div
          className="absolute inset-y-0 left-0 rounded-l-full pointer-events-none"
          style={{
            width: '35%',
            background: 'linear-gradient(90deg, rgba(0, 255, 100, 0.1) 0%, rgba(0, 255, 100, 0.05) 40%, rgba(0, 255, 100, 0.02) 70%, rgba(0, 255, 100, 0) 100%)',
          }}
        />
      )}

      {/* Right edge shadow - only show when expanded */}
      {expanded && (
        <div
          className="absolute inset-y-0 right-0 rounded-r-full pointer-events-none"
          style={{
            width: '35%',
            background: 'linear-gradient(270deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.05) 70%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
      )}
      
      {/* Bottom curvature - deep shadow */}
      <div 
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '50%',
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Bottom edge contact shadow */}
      <div 
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '20%',
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Inner diffuse glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 40px rgba(0, 255, 100, 0.15)',
          opacity: 0.7,
        }}
      />
      
      {/* Micro edge definition */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.10)',
        }}
      />

      {/* Navigation items container */}
      <div 
        ref={containerRef}
        className="relative z-10 h-full flex items-center justify-center px-6"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {/* Collapsed state - show only active section with smooth text transitions */}
        {!expanded && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  className="flex items-center gap-2"
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 680,
                    color: '#00ff64',
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textShadow: `
                      0 0 10px rgba(0, 255, 100, 0.5),
                      0 0 20px rgba(0, 255, 100, 0.3),
                      0 1px 2px rgba(0, 0, 0, 0.8)
                    `,
                  }}
                >
                  <activeItem.icon size={16} strokeWidth={2.5} />
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expanded state - show all sections with stagger */}
        {expanded && (
          <div className="flex items-center justify-evenly w-full">
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleSectionClick(item.id)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    fontSize: isActive ? '15.5px' : '15px',
                    fontWeight: isActive ? 680 : 510,
                    color: isActive ? '#00ff64' : '#888888',
                    textDecoration: 'none',
                    letterSpacing: '0.45px',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                    textShadow: isActive
                      ? `
                        0 0 10px rgba(0, 255, 100, 0.5),
                        0 0 20px rgba(0, 255, 100, 0.3),
                        0 1px 2px rgba(0, 0, 0, 0.8)
                      `
                      : `
                        0 1px 2px rgba(0, 0, 0, 0.6)
                      `,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#cccccc'
                      e.currentTarget.style.transform = 'translateY(-0.5px)'
                      e.currentTarget.style.textShadow = `
                        0 1px 2px rgba(0, 0, 0, 0.7)
                      `
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#888888'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.textShadow = `
                        0 1px 2px rgba(0, 0, 0, 0.6)
                      `
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    <item.icon size={16} strokeWidth={2.5} />
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </motion.nav>
  )
}
