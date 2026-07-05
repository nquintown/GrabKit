'use client'

import { useEffect, useState, useRef } from 'react'

interface AdInterstitialProps {
  onDownload: () => void
  onClose: () => void
}

const TIMER_DURATION = 10

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdInterstitial({ onDownload, onClose }: AdInterstitialProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [ready, setReady] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setReady(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Ad blocker or not loaded
    }
  }, [])

  const progress = ((TIMER_DURATION - timeLeft) / TIMER_DURATION) * 100

  function handleDownload() {
    onDownload()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <svg className="size-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>

        {/* Ad zone */}
        <div className="border-b border-gray-100 bg-gray-50 px-4 pt-4 pb-3 min-h-[120px] flex flex-col justify-center">
          <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-gray-400">
            Publicité
          </p>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-8073783780020241"
            data-ad-slot="4402175785"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Timer + CTA */}
        <div className="px-6 py-6">
          <div className="mb-4 text-center">
            <p className="text-base font-semibold text-gray-800">
              GrabKit est 100&nbsp;% gratuit
            </p>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">
              10 secondes de pub suffisent à faire vivre l&apos;outil.<br />
              Merci pour votre soutien&nbsp;!
            </p>
            {!ready && (
              <p className="mt-2 text-xs text-gray-400">
                Encore{' '}
                <span className="font-bold tabular-nums text-gray-600">{timeLeft}s</span>
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-900 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleDownload}
            disabled={!ready}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Passer
          </button>
        </div>
      </div>
    </div>
  )
}
