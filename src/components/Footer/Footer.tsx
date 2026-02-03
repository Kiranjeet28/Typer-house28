"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const pathname = usePathname();
  const [hideFeedback, setHideFeedback] = useState(false)

  useEffect(() => {
    try {
      const v = typeof window !== 'undefined' ? localStorage.getItem('feedback_submitted') : null
      if (v) setHideFeedback(true)
      const onSubmitted = () => setHideFeedback(true)
      window.addEventListener('feedback:submitted', onSubmitted as EventListener)
      return () => window.removeEventListener('feedback:submitted', onSubmitted as EventListener)
    } catch (e) { }
  }, [])

  if (pathname?.includes('/dashboard')) {
    return null;
  }

  return (
    <footer className="w-full pt-7 pb-3 border-t border-border flex justify-between items-center flex-wrap gap-5">
      <div className="text-muted-foreground flex gap-2 items-center">
        <Link href="/terms" className="hover:text-foreground transition-colors">
          Terms & Conditions
        </Link>
        <span>|</span>
        <Link href="/privacy" className="hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
        <span>|</span>
        {!hideFeedback && (
          <Link href="#feedback" className="hover:text-foreground transition-colors">
            Feedback
          </Link>
        )}
      </div>

      <div className="flex gap-3">
        <a
          href="https://github.com/kiranjeet28"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/github.svg"
            alt="GitHub"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </a>
        <a
          href="https://www.linkedin.com/in/kiranjeet28/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/LinkedIn.png"
            alt="LinkedIn"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </a>
        <a
          href="https://www.instagram.com/k_jeet_x/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:opacity-70 transition-opacity"
        >
          <Image
            src="/assets/instagram.svg"
            alt="Instagram"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </a>
      </div>

      <p className="text-muted-foreground">
        © 2025 Kiranjeet Kour. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;