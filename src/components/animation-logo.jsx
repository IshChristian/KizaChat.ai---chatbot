"use client"

import { useState, useEffect } from "react"

const fonts = ["font-serif", "font-sans", "font-mono", "font-bold", "font-extrabold", "italic"]

export default function AnimatedLogo() {
  const [currentFont, setCurrentFont] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentFont((prev) => (prev + 1) % fonts.length)
    }, 2000) // Change font every 2 seconds

    return () => clearInterval(intervalId)
  }, [])

  return <span className={`text-white transition-all duration-500 ${fonts[currentFont]}`}>KizaChat.ai</span>
}

