import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrabKit — Récupérez les assets visuels de n\'importe quelle page web',
  description:
    'Collez une URL, GrabKit scanne la page et liste tous les assets visuels : SVG, images, favicons, polices, médias. Filtrez, sélectionnez et téléchargez en ZIP.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f5f6f7] font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
