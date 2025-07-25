import React from 'react';
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Harmonium – Modern UI by Dhruv Akbari',
  description: 'Harmonium is a modern UI component library for Next.js, created by Dhruv Akbari. Fast, accessible, and beautiful.',
  keywords: [
    'Harmonium',
    'UI library',
    'Next.js',
    'React',
    'Dhruv Akbari',
    'Component library',
    'Tailwind CSS',
    'Modern UI',
    'Accessible',
    'Open Source'
  ],
  authors: [{ name: 'Dhruv Akbari', url: 'https://github.com/mrakbari91' }],
  creator: 'Dhruv Akbari',
  openGraph: {
    title: 'Harmonium – Modern UI by Dhruv Akbari',
    description: 'Harmonium is a modern UI component library for Next.js, created by Dhruv Akbari.',
    siteName: 'Web Harmonium',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'Harmonium Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="author" content="Dhruv Akbari" />
        <meta name="keywords" content="Harmonium, UI library, Next.js, React, Dhruv Akbari, Component library, Tailwind CSS, Modern UI, Accessible, Open Source" />
        <meta name="google-site-verification" content="M71tdDiU-O499RIu-uqiDLBLkJAVh67t9e107tz2UVk" />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
