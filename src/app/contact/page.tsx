'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar, PublicFooter } from '@/components/layout/PublicNav';
import { Mail, CheckCircle2, AlertCircle, Send, MessageSquare, Shield, Clock } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setStatus('submitting');

    // Simulate clean submission handling (until a backend mail integration is connected)
    setTimeout(() => {
      setStatus('success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-soft)]">
      <PublicNavbar />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-10 w-full space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
              Support & Inquiries
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Contact SUBCONSCIOUS LOG.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
            Have a question regarding your journal, billing, or privacy? Our desk responds to all inquiries within one to two business days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Details & Context */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                Direct Channels
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[var(--text-muted)] font-mono text-[11px]">General & Support</p>
                    {SITE_CONFIG.supportEmail ? (
                      <a
                        href={`mailto:${SITE_CONFIG.supportEmail}`}
                        className="font-medium text-[var(--text-primary)] hover:underline font-mono"
                      >
                        {SITE_CONFIG.supportEmail}
                      </a>
                    ) : (
                      <p className="text-[var(--text-muted)] font-mono text-[11px]">
                        Pending configuration (set NEXT_PUBLIC_SUPPORT_EMAIL)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[var(--text-muted)] font-mono text-[11px]">Privacy & Security</p>
                    {SITE_CONFIG.privacyEmail ? (
                      <a
                        href={`mailto:${SITE_CONFIG.privacyEmail}`}
                        className="font-medium text-[var(--text-primary)] hover:underline font-mono"
                      >
                        {SITE_CONFIG.privacyEmail}
                      </a>
                    ) : (
                      <p className="text-[var(--text-muted)] font-mono text-[11px]">
                        Pending configuration (set NEXT_PUBLIC_PRIVACY_EMAIL)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[var(--text-muted)] font-mono text-[11px]">Target Response Standard</p>
                    <p className="text-[var(--text-secondary)] font-light">Monday – Friday · 24–48h when active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] space-y-3">
              <h3 className="text-sm font-display font-medium text-[var(--text-primary)]">
                Looking for answers quickly?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                Many common questions about exports, privacy, and SUBCONSCIOUS LOG Pro are answered in our knowledge base.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
              >
                <span>Read the FAQ</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7">
            <div className="p-7 sm:p-9 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl">
              {status === 'success' ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-2xl font-display font-medium text-[var(--text-primary)]">
                    Form Validation Successful
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed max-w-sm mx-auto">
                    Form validation passed for <span className="font-mono text-[var(--text-primary)]">{formData.name}</span> (<span className="font-mono text-[var(--text-primary)]">{formData.email}</span>).
                  </p>
                  <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[11px] font-mono text-[var(--text-muted)] text-left space-y-1">
                    <p className="text-[var(--accent)] font-semibold uppercase tracking-wider text-[10px]">Staging / Integration Note</p>
                    <p>Live email delivery activates once an email API (e.g., Resend / Postmark / SES) is connected to <code className="text-[var(--text-primary)]">/api/contact</code>.</p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                        setStatus('idle');
                      }}
                      className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status === 'error' && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-500 font-mono">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      Your Name <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Clara Oswald"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:outline-none text-xs text-[var(--text-primary)] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      Email Address <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:outline-none text-xs text-[var(--text-primary)] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:outline-none text-xs text-[var(--text-primary)] transition-colors"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Product Support">Product Support</option>
                      <option value="Billing & Subscription">Billing & Subscription</option>
                      <option value="Privacy & Data Request">Privacy & Data Request</option>
                      <option value="Security Report">Security Vulnerability Report</option>
                      <option value="Feedback / Feature Request">Feedback / Feature Request</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      Message <span className="text-[var(--accent)]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="How can we assist you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:outline-none text-xs text-[var(--text-primary)] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-medium uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {status === 'submitting' ? (
                        <span>Sending message...</span>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send size={13} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1 text-center pt-2">
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      Staging Notice: Live email dispatch activates once NEXT_PUBLIC_SUPPORT_EMAIL and a mail provider are connected.
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      Contact information is used solely to reply to inquiries. Never sold or shared.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
