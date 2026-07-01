'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { startIntroAudio, stopScratch, fadeOutMusic, chime } from './introAudio'

// Timing of the signature ceremony (ms)
const WRITE_MS = 5200 // slow, deliberate handwriting
const HOLD_MS = 1500 // let the finished name glow
const FADE_MS = 1300 // dissolve the black into the site

// Feeds the writing duration to the CSS animations via a custom property.
const writeVar = { '--write': `${WRITE_MS}ms` } as React.CSSProperties

// Artwork data
const flagshipWorks = [
  {
    id: 1,
    title: 'Untitled (Gorilla)',
    year: 2024,
    medium: 'Mixed media on canvas',
    series: 'Creatures',
    image: '/img/gorilla.jpg',
    description: 'A visceral exploration of primal rage and power'
  },
  {
    id: 2,
    title: 'Boba Fett Study',
    year: 2024,
    medium: 'Mixed media on paper',
    series: 'Pop Icons',
    image: '/img/bobafett.jpg',
    description: 'Recontextualizing pop culture through contemporary portraiture'
  },
  {
    id: 3,
    title: 'Cephalopod Study',
    year: 2024,
    medium: 'Graphite and ink on paper',
    series: 'Studies',
    image: '/img/octopus.jpg',
    description: 'Detailed anatomical exploration of form and movement'
  },
  {
    id: 4,
    title: 'Ascension',
    year: 2024,
    medium: 'Acrylic on canvas',
    series: 'Creatures',
    image: '/img/apocalypse.jpg',
    description: 'Exploring the grotesque as a pathway to transcendence'
  },
  {
    id: 5,
    title: 'Spark It Up',
    year: 2024,
    medium: 'Acrylic and mixed media on canvas',
    series: 'Pop Icons',
    image: '/img/sparkitup.jpg',
    description: 'Celebrating youth, energy, and creative rebellion'
  }
]

const galleryWorks = flagshipWorks // In production, this would be expanded

export default function Home() {
  // Intro ceremony state
  const [entered, setEntered] = useState(false) // user gesture given, writing begins
  const [writingDone, setWritingDone] = useState(false) // signature complete, glowing
  const [exiting, setExiting] = useState(false) // black overlay dissolving
  const [overlayGone, setOverlayGone] = useState(false) // overlay unmounted
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    inquiryType: 'general'
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Honor reduced-motion / SSR: skip the ceremony entirely.
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setOverlayGone(true)
    }
  }, [])

  // Lock scroll while the overlay is present.
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.classList.toggle('intro-lock', !overlayGone)
    return () => document.body.classList.remove('intro-lock')
  }, [overlayGone])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const beginExit = useCallback(() => {
    setExiting(true)
    fadeOutMusic()
    timers.current.push(setTimeout(() => setOverlayGone(true), FADE_MS))
  }, [])

  const handleEnter = useCallback(() => {
    if (entered) return
    setEntered(true)
    void startIntroAudio(WRITE_MS)
    // Signature finishes writing
    timers.current.push(
      setTimeout(() => {
        setWritingDone(true)
        stopScratch()
        chime()
      }, WRITE_MS)
    )
    // Hold on the glowing name, then dissolve into the site
    timers.current.push(setTimeout(beginExit, WRITE_MS + HOLD_MS))
  }, [entered, beginExit])

  const handleSkip = useCallback(() => {
    stopScratch()
    beginExit()
  }, [beginExit])

  // Escape skips the intro once it has begun.
  useEffect(() => {
    if (!entered || overlayGone) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, overlayGone, handleSkip])

  const series = ['Creatures', 'Pop Icons', 'Studies']
  const filteredWorks = selectedSeries
    ? galleryWorks.filter(work => work.series === selectedSeries)
    : galleryWorks

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('loading')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setFormStatus('success')
        setFormData({ name: '', email: '', message: '', inquiryType: 'general' })
        setTimeout(() => setFormStatus('idle'), 3000)
      } else {
        setFormStatus('error')
      }
    } catch (error) {
      setFormStatus('error')
    }
  }

  return (
    <>
      {/* Majestic signature intro */}
      {!overlayGone && (
        <div className={`intro-overlay${exiting ? ' intro-exit' : ''}`}>
          <div className={`intro-stage${writingDone ? ' is-done' : ''}`}>
            {entered && (
              <>
                <div className={`intro-sign${writingDone ? ' is-done' : ''}`}>
                  <span className="intro-sign-text" style={writeVar}>
                    Xavier Lopez
                  </span>
                  {!writingDone && (
                    <span className="intro-pen" style={writeVar} aria-hidden="true">
                      <span className="intro-pen-nib" />
                    </span>
                  )}
                </div>
                <p className="intro-tagline">Contemporary Artist</p>
              </>
            )}
          </div>

          {!entered && (
            <button className="intro-gate" onClick={handleEnter} aria-label="Enter the portfolio">
              <span className="intro-gate-ring" />
              <span className="intro-gate-label">Xavier Lopez</span>
              <span className="intro-gate-sub">tap to enter</span>
            </button>
          )}

          {entered && !exiting && (
            <button className="intro-skip" onClick={handleSkip}>
              Skip
            </button>
          )}
        </div>
      )}

      {/* Portfolio */}
      <>
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="text-2xl font-bold tracking-wide">XL</div>
              <ul className="flex gap-8 text-sm font-medium">
                <li><a href="#works" className="hover:text-red-600 transition">Works</a></li>
                <li><a href="#about" className="hover:text-red-600 transition">About</a></li>
                <li><a href="#contact" className="hover:text-red-600 transition">Contact</a></li>
              </ul>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center px-4 sm:px-6 lg:px-8 py-20 animate-fade-in-up">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-4">Contemporary Artist</p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">Xavier Lopez</h1>
                <p className="text-lg text-stone-600 mb-8 max-w-md leading-relaxed">
                  Richmond-based artist exploring visceral portraiture, pop culture subversion, and the grotesque as a pathway to beauty.
                </p>
                <a href="#works" className="inline-block bg-stone-900 text-white px-8 py-4 rounded-none font-semibold hover:bg-red-600 transition duration-300">
                  View Selected Works
                </a>
              </div>
              <div className="h-96 md:h-full rounded-lg overflow-hidden bg-stone-200">
                <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center text-stone-500">
                  [Featured Artwork]
                </div>
              </div>
            </div>
          </section>

          {/* Selected Works */}
          <section id="works" className="bg-white px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-2">Selected Works</h2>
              <p className="text-stone-600 mb-16">Flagship pieces representing core artistic interests</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {flagshipWorks.map((work, idx) => (
                  <div key={work.id} className="gallery-item group" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="bg-stone-200 aspect-square rounded-lg overflow-hidden mb-4">
                      <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center text-stone-500 group-hover:brightness-90 transition">
                        {work.title}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{work.title}</h3>
                    <p className="text-sm text-stone-600">{work.year} • {work.medium}</p>
                    <p className="text-sm text-red-600 font-semibold mt-2">{work.series}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Full Gallery */}
          <section className="bg-stone-50 px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">Full Gallery</h2>
              
              {/* Series Filter */}
              <div className="flex flex-wrap gap-3 mb-12">
                <button
                  onClick={() => setSelectedSeries(null)}
                  className={`px-6 py-2 rounded-none font-semibold transition ${
                    selectedSeries === null
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-900 border border-stone-300 hover:border-stone-900'
                  }`}
                >
                  All Works
                </button>
                {series.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeries(s)}
                    className={`px-6 py-2 rounded-none font-semibold transition ${
                      selectedSeries === s
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-900 border border-stone-300 hover:border-stone-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredWorks.map((work) => (
                  <div key={work.id} className="gallery-item bg-white p-3 rounded-lg hover:shadow-lg transition">
                    <div className="bg-stone-200 aspect-square rounded mb-3">
                      <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center text-stone-500 text-sm">
                        {work.title}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm truncate">{work.title}</h4>
                    <p className="text-xs text-stone-600">{work.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="bg-white px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-stone-200 aspect-square rounded-lg"></div>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">About</h2>
                <div className="space-y-6 text-stone-700 leading-relaxed">
                  <p>
                    Xavier Lopez, known to friends and community as "X," is a creative force rooted in culture, service, and human connection. Born in San Antonio, Texas, and raised between Crewe, Virginia, and Las Vegas, Nevada, he carries the influence of diverse places that shaped his perspective and character.
                  </p>
                  <p>
                    His artistic practice emerges from a fascination with the boundaries between the familiar and the unsettling. Through detailed studies, pop culture retellings, and creature explorations, Xavier investigates what happens when we strip away comfort and lean into the raw. Each piece is an invitation to sit with discomfort, find humor in the grotesque, and recognize the human in the monstrous.
                  </p>
                  <p>
                    Much of his time is devoted to community service in Central and Northern Virginia, where he volunteers regularly and leads summer art camps. Xavier believes art belongs to everyone, and his work both on canvas and in community spaces reflects this commitment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="bg-stone-900 text-white px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
              <p className="text-stone-300 mb-12">For exhibitions, collaborations, commissions, or inquiries</p>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-stone-800 border border-stone-700 px-4 py-3 rounded text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-stone-800 border border-stone-700 px-4 py-3 rounded text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Inquiry Type</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 px-4 py-3 rounded text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="exhibition">Exhibition Interest</option>
                    <option value="commission">Commission Request</option>
                    <option value="collaboration">Collaboration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    rows={6}
                    className="w-full bg-stone-800 border border-stone-700 px-4 py-3 rounded text-white focus:outline-none focus:border-red-600 resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-700 text-white font-semibold py-3 rounded transition duration-300"
                >
                  {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
                {formStatus === 'success' && (
                  <p className="text-green-400 text-sm">Message sent successfully!</p>
                )}
                {formStatus === 'error' && (
                  <p className="text-red-400 text-sm">Error sending message. Please try again.</p>
                )}
              </form>

              <div className="mt-12 pt-8 border-t border-stone-800 flex gap-6 justify-center">
                <a href="mailto:xmanart77@gmail.com" className="text-red-600 hover:text-red-400 transition">Email</a>
                <a href="tel:+18045926328" className="text-red-600 hover:text-red-400 transition">Call</a>
                <a href="https://instagram.com" className="text-red-600 hover:text-red-400 transition">Instagram</a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-stone-950 text-stone-400 px-4 sm:px-6 lg:px-8 py-8 text-center text-sm">
            <p>&copy; 2024 Xavier Lopez. All rights reserved.</p>
          </footer>
      </>
    </>
  )
}
