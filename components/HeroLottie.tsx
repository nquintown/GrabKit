'use client'

import dynamic from 'next/dynamic'
import animationData from '@/public/hero-lottie.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function HeroLottie() {
  return (
    <div className="mx-auto w-48 sm:w-56" style={{ mixBlendMode: 'multiply' }}>
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}
