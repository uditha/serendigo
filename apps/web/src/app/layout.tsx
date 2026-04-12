import type { Metadata } from 'next'
import { DM_Serif_Display, Space_Grotesk } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-serif' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SerendiGO — The Living Guide to Sri Lanka',
  description: 'Discover Sri Lanka through story arcs, collect province stamps, and support the families that make this island extraordinary.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-cream text-dark antialiased">{children}</body>
    </html>
  )
}
