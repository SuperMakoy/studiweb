import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />

      {/* Top left decorations */}
      <Image
        src="/decorative-book.svg"
        alt=""
        width={64}
        height={64}
        className="hidden md:block absolute top-32 left-12 opacity-20 animate-float"
      />
      <Image
        src="/decorative-lightbulb.svg"
        alt=""
        width={56}
        height={56}
        className="hidden md:block absolute top-48 left-32 opacity-15 animate-float-delayed"
      />

      {/* Top right decorations */}
      <Image
        src="/decorative-star.svg"
        alt=""
        width={40}
        height={40}
        className="hidden md:block absolute top-24 right-32 opacity-20 animate-float"
      />
      <Image
        src="/decorative-graduation.svg"
        alt=""
        width={64}
        height={64}
        className="hidden md:block absolute top-40 right-12 opacity-15 animate-float-delayed"
      />

      {/* Middle decorations */}
      <Image
        src="/decorative-pencil.svg"
        alt=""
        width={48}
        height={48}
        className="hidden md:block absolute top-1/2 left-8 opacity-10 animate-float"
      />
      <Image
        src="/decorative-rocket.svg"
        alt=""
        width={48}
        height={48}
        className="hidden md:block absolute top-1/2 right-24 opacity-15 animate-float-delayed"
      />

      {/* Bottom decorations */}
      <Image
        src="/decorative-trophy.svg"
        alt=""
        width={48}
        height={48}
        className="hidden md:block absolute bottom-32 left-24 opacity-20 animate-float"
      />
      <Image
        src="/decorative-target.svg"
        alt=""
        width={56}
        height={56}
        className="hidden md:block absolute bottom-24 right-48 opacity-15 animate-float-delayed"
      />

      {/* Small accent decorations */}
      <Image
        src="/decorative-sparkle.svg"
        alt=""
        width={32}
        height={32}
        className="hidden md:block absolute top-64 left-64 opacity-25 animate-float"
      />
      <Image
        src="/decorative-checkmark.svg"
        alt=""
        width={40}
        height={40}
        className="hidden md:block absolute bottom-48 left-48 opacity-20 animate-float-delayed"
      />
      <Image
        src="/decorative-brain.svg"
        alt=""
        width={56}
        height={56}
        className="hidden md:block absolute top-1/3 right-64 opacity-15 animate-float"
      />

      <main className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-16 py-8 md:py-20 gap-8 md:gap-0">
        {/* Left Side - Illustration */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
          <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px]">
            <svg width="0" height="0">
              <defs>
                <clipPath id="blobClip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.5,0 C 0.8,0.05 0.95,0.2 1,0.5 C 1.05,0.8 0.9,0.95 0.6,0.98 C 0.3,1.01 0.1,0.9 0.05,0.6 C 0,0.3 0.2,-0.05 0.5,0 Z" />
                </clipPath>
              </defs>
            </svg>

            <div className="relative w-full h-full" style={{ clipPath: "url(#blobClip)" }}>
              <img src="/hero-vector-illustration.svg" alt="Student studying" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left order-1 md:order-2">
          <h1 className="text-3xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-8">
            MAKE STUDYING <span className="text-[#5B6EE8]">FUN</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed px-4 md:px-0">
            Transform your study materials into engaging quiz games. Upload your files, let AI create personalized
            quizzes, and make learning interactive and enjoyable.
          </p>
          <Link href="/signup">
            <Button className="bg-[#5B6EE8] text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-lg hover:bg-[#4A5AC9]">
              Learn More
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
