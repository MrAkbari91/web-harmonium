import React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Harmonium – Beautiful Next.js UI Component Library',
  description:
    'Harmonium is an open-source, accessible, and modern UI component library built with Tailwind CSS and designed for React and Next.js. Fast, elegant, and easy to use. developed by Dhruv Akbari.',
  keywords: [
    'Harmonium UI',
    'React component library',
    'Next.js UI components',
    'Tailwind CSS components',
    'Modern UI design',
    'Open source UI kit',
    'UI framework for Next.js',
    'React design system',
    'Accessible components',
    'Web components library',
    'React UI system',
    'Next.js frontend library',
    'Dhruv Akbari UI',
    'Figma to React UI',
    'Beautiful UI components',
    'React Tailwind components',
    'Frontend development tools',
    'Developer UI tools',
    'Fast UI components',
    'Component-based design system',
  ],
  authors: [{ name: 'Dhruv Akbari', url: 'https://dhruvakbari.vercel.app' }],
  creator: 'Dhruv Akbari',
  openGraph: {
    title: 'Harmonium – Beautiful React & Next.js UI Library',
    description:
      'Harmonium is a fast, modern, and accessible component library for Next.js, built with Tailwind CSS by Dhruv Akbari.',
    siteName: 'Web Harmonium',
    url: 'https://web-harmonium.vercel.app/',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Harmonium – React UI Components for Next.js',
    description:
      'Harmonium is a modern, accessible, and open-source UI library for React and Next.js built with Tailwind CSS.',
    images: ['/favicon.png'],
    creator: '@mr_akbari_', // Replace with your Twitter handle
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="author" content="Dhruv Akbari" />
        <meta name="keywords" content="Harmonium UI, React component library, Next.js UI components, Tailwind CSS components, Modern UI, Accessible UI, Open source UI, React design system, Web UI components, Fast UI components" />
        <meta name="description" content="Harmonium is an open-source, accessible, and modern UI component library for React and Next.js, styled with Tailwind CSS." />
        <meta name="google-site-verification" content="M71tdDiU-O499RIu-uqiDLBLkJAVh67t9e107tz2UVk" />
        <meta name="msvalidate.01" content="231D77D496F630213E38C67872F5028B" />
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
  );
}
