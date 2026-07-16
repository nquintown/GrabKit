import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrabKit — Extrayez & exportez les assets de n\'importe quelle page',
  description:
    'Collez une URL, GrabKit scanne la page et liste tous les assets visuels : SVG, images, favicons, polices, médias. Filtrez, sélectionnez et téléchargez en ZIP.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f5f6f7] font-sans text-gray-900 antialiased">
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8073783780020241"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  )
}
