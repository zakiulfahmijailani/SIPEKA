"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionState, setTransitionState] = useState<"enter" | "exit">("enter")
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname

    // Start exit
    setTransitionState("exit")
    const t = setTimeout(() => {
      setDisplayChildren(children)
      setTransitionState("enter")
    }, 120)

    return () => clearTimeout(t)
  }, [pathname, children])

  return (
    <div
      style={{
        opacity: transitionState === "enter" ? 1 : 0,
        transform: transitionState === "enter" ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 180ms cubic-bezier(0.16,1,0.3,1), transform 180ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {displayChildren}
    </div>
  )
}
