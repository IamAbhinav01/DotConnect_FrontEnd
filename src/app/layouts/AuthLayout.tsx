import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'motion/react'

export const AuthLayout: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-ink flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-pink/30 selection:text-pink">
      {/* Background Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Cursor-Following Neon Pink Glow */}
      <motion.div
        className="pointer-events-none fixed w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 -z-10 bg-pink"
        animate={{
          x: mousePos.x - 250,
          y: mousePos.y - 250,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
      />

      {/* Top Brand Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-pink flex items-center justify-center font-bold text-black font-display shadow-[0_0_24px_rgba(255,45,168,0.4)]">
          ●
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-text">
          DotConnect
        </span>
      </div>

      {/* Main Glass Card Form Container */}
      <div className="w-full max-w-md rounded-2xl glass-panel p-8 shadow-2xl relative z-10 border border-white/10">
        <Outlet />
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-xs text-muted/60">
        Secure Microservices Architecture • Powered by Go & Node.js
      </div>
    </div>
  )
}
