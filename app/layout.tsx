import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Xavier Lopez | Contemporary Artist',
  description: 'Portfolio of Xavier Lopez - contemporary artist exploring visceral portraiture, pop culture, and creatures.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Playfair+Display:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-50 text-stone-900">{children}</body>
    </html>
  )
}
