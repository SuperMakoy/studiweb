"use client"

import { useEffect, useState } from "react"

export default function WelcomeBanner() {
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const today = new Date()
    const formatted = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    setCurrentDate(formatted)
  }, [])

  return (
    <div className="bg-gradient-to-r from-[#5B6EE8] to-[#7080F0] text-white rounded-lg md:rounded-3xl p-3 md:p-8 flex items-center justify-between overflow-hidden relative">
      {/* Left Content */}
      <div className="z-10 flex-1">
        <p className="text-[10px] md:text-sm opacity-80 mb-0.5 md:mb-2">{currentDate}</p>
        <h2 className="text-base md:text-4xl font-bold mb-0.5 md:mb-2">Welcome back, Makoy!</h2>
        <p className="text-[10px] md:text-lg opacity-90">Great to see you enjoy learning</p>
      </div>

      <div className="hidden md:block relative w-80 h-64 z-10">
        <svg
          className="absolute right-0 bottom-0"
          width="280"
          height="260"
          viewBox="0 0 280 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle cx="140" cy="70" r="40" fill="#FFD4A3" />

          {/* Hair */}
          <path
            d="M105 65 Q100 45 112 35 Q125 28 140 28 Q155 28 168 35 Q180 45 175 65 Q172 52 162 45 Q150 40 140 40 Q130 40 118 45 Q108 52 105 65"
            fill="#4A3428"
          />

          {/* Eyes */}
          <circle cx="128" cy="68" r="4" fill="#2C2C2C" />
          <circle cx="152" cy="68" r="4" fill="#2C2C2C" />

          {/* Smile */}
          <path d="M122 82 Q140 92 158 82" stroke="#2C2C2C" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Body with white shirt */}
          <path d="M100 110 Q140 105 180 110 L185 200 Q140 210 95 200 Z" fill="#FFFFFF" opacity="0.95" />

          {/* Collar details */}
          <path d="M120 110 Q140 115 160 110" stroke="#5B6EE8" strokeWidth="2" opacity="0.3" />

          {/* Left arm holding notebook */}
          <path d="M100 120 L80 160 L88 165 L108 125" fill="#FFD4A3" />
          <ellipse cx="82" cy="163" rx="10" ry="14" transform="rotate(-20 82 163)" fill="#FFD4A3" />

          {/* Right arm raised */}
          <path d="M180 120 L210 90 L206 85 L176 115" fill="#FFD4A3" />
          <ellipse cx="209" cy="87" rx="10" ry="14" transform="rotate(30 209 87)" fill="#FFD4A3" />

          {/* Notebook in left hand - larger and more detailed */}
          <rect x="60" y="155" width="65" height="85" rx="4" fill="#51CF66" />
          <rect x="66" y="161" width="53" height="73" rx="3" fill="#FFFFFF" opacity="0.95" />

          {/* Notebook lines */}
          <line x1="72" y1="175" x2="110" y2="175" stroke="#51CF66" strokeWidth="2" opacity="0.4" />
          <line x1="72" y1="185" x2="113" y2="185" stroke="#51CF66" strokeWidth="2" opacity="0.4" />
          <line x1="72" y1="195" x2="108" y2="195" stroke="#51CF66" strokeWidth="2" opacity="0.4" />
          <line x1="72" y1="205" x2="113" y2="205" stroke="#51CF66" strokeWidth="2" opacity="0.4" />
          <line x1="72" y1="215" x2="105" y2="215" stroke="#51CF66" strokeWidth="2" opacity="0.4" />

          {/* Notebook spiral binding */}
          <circle cx="70" cy="170" r="3" fill="#51CF66" opacity="0.6" />
          <circle cx="70" cy="185" r="3" fill="#51CF66" opacity="0.6" />
          <circle cx="70" cy="200" r="3" fill="#51CF66" opacity="0.6" />
          <circle cx="70" cy="215" r="3" fill="#51CF66" opacity="0.6" />
          <circle cx="70" cy="230" r="3" fill="#51CF66" opacity="0.6" />

          {/* Decorative stars around the person */}
          <path
            d="M220 70 L223 78 L231 78 L225 84 L228 92 L220 87 L212 92 L215 84 L209 78 L217 78 Z"
            fill="#FFD43B"
            opacity="0.9"
          />
          <path
            d="M60 100 L62 106 L68 106 L63 110 L65 116 L60 112 L55 116 L57 110 L52 106 L58 106 Z"
            fill="#FF6B6B"
            opacity="0.8"
          />
          <path
            d="M190 180 L192 185 L197 185 L193 188 L195 193 L190 190 L185 193 L187 188 L183 185 L188 185 Z"
            fill="#FFD43B"
            opacity="0.7"
          />

          {/* Checkmark badge */}
          <circle cx="240" cy="140" r="22" fill="#FFFFFF" opacity="0.4" />
          <path
            d="M230 140 L236 146 L250 132"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
