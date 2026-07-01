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
      <body className="bg-stone-50 text-stone-900">{children}</body>
    </html>
  )
}
