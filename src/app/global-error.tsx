'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Critical root layout error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#101013',
          color: '#EBDDC6',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '480px', padding: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '16px',
              backgroundColor: 'rgba(197, 179, 143, 0.1)',
              border: '1px solid rgba(197, 179, 143, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="38"
              viewBox="0 0 100 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 50 6 L 88 28 L 88 92 L 50 114 L 12 92 L 12 28 Z"
                stroke="#C5B38F"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              <path
                d="M 32 92 L 32 46 L 50 36 L 68 46 L 68 92 Z"
                fill="#C5B38F"
              />
              <rect x="46" y="52" width="8" height="40" fill="#101013" />
            </svg>
          </div>

          <span
            style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C5B38F',
              marginBottom: '12px',
              fontFamily: 'monospace',
            }}
          >
            Subconscious Log · System Notice
          </span>

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#F3EBDD',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            A momentary interruption
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#9E998E',
              margin: '0 0 28px',
            }}
          >
            An unexpected error occurred while loading the application shell.
            Your entries and account data remain intact.
          </p>

          <button
            onClick={() => reset()}
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              backgroundColor: '#C5B38F',
              color: '#101013',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
