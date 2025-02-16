"use client"

import { useState, useEffect } from "react"

export default function AnimatedText({ text, className }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, prev.length + 1))
      i++
      if (i === text.length) clearInterval(intervalId)
    }, 20) // Adjust timing as needed

    return () => clearInterval(intervalId)
  }, [text])

  return <p className={className}>{displayedText}</p>
}

