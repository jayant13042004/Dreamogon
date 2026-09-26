'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Card, Input, Button, Spinner } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { Moon, Sun, Monitor, Download, Trash2, AlertTriangle, X, Check, Sparkles, Shield, Infinity as InfinityIcon, LogOut } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { Analytics } from '@/lib/analytics';

type BillingCatalogItem = {
  id: string;
  name: string;
  headline: string;
  priceLabel: string;
  intervalLabel: string;
  features: string[];
  aiLimit: number;
};

type BillingStatus = {
  planTier: 'free' | 'pro';
  plan: {
    id: string;
    name: string;
    headline: string;
    description: string;
    priceLabel: string;
    currency: string;
    interval: string | null;
    intervalLabel: string;
    features: string[];
  };
  catalog: {
    free: BillingCatalogItem;
    pro_monthly: BillingCatalogItem;
    pro_annual: BillingCatalogItem;
  };
  subscription: {
    status: string;
    provider: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    interval?: string;
  } | null;
  aiUsage: {
    planTier: string;
    limit: number;
    used: number;
    remaining: number;
    periodKey: string;
  };
};

function BillingSuccessToast() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const billing = searchParams.get('billing');
    if (billing === 'success') {
      toast.success('Welcome to Subconscious Log Pro — your plan will update in a moment.');
    } else if (billing === 'canceled') {
      toast.error('Checkout canceled. You can upgrade anytime.');
    }
  }, [searchParams]);
  return null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      window.location.href = '/login';
    }
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingAction, setBillingAction] = useState(false);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const [name, setName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile?.name) setName(profile.name);

      setLoading(false);
    }

    loadProfile();
  }, [user, supabase]);

  useEffect(() => {
    async function loadBilling() {
      if (!user) return;
      setBillingLoading(true);
      try {
        const res = await fetch('/api/billing/status');
        if (res.ok) setBilling(await res.json());
      } catch {
        // non-blocking
      } finally {
        setBillingLoading(false);
      }
    }
    loadBilling();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      await supabase.auth.signOut();
      toast.success('Your account and dream records have been completely deleted.');
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete account. Please try again.');
      setDeletingAccount(false);
    }
  };

  const handleExportData = async (format: 'json' | 'markdown' = 'json') => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('dreams')
        .select('*, dream_tags(tag), dream_entities(*)')
        .eq('user_id', user.id)
        .order('dream_date', { ascending: false });

      if (!data || data.length === 0) {
        toast.error('No dream entries found to export.');
        return;
      }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subconsciouslog_dreams_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Dream archive exported as JSON');
      } else {
        const mdContent = data
          .map((d: any) => {
            const tags = (d.dream_tags || []).map((t: any) => t.tag).join(', ');
            const reflection = d.ai_summary || d.ai_analysis?.summary || '';
            return `---
title: "${(d.title || 'Untitled Dream').replace(/"/g, '\\"')}"
date: ${d.dream_date || ''}
mood: ${d.mood || 'unspecified'}
lucidity: ${d.lucidity || 'not_sure'}
tags: [${tags}]
---

# ${d.title || 'Untitled Dream'}
*Recorded on ${d.dream_date || 'Unknown date'}*

## Dream Content
${d.content || '(No content)'}

${reflection ? `## AI Reflection\n${reflection}\n` : ''}
***
`;
          })
          .join('\n\n');

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subconsciouslog_dreams_export_${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Dream archive exported as Markdown');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    }
  };

  const startCheckout = async (planId: 'pro_monthly' | 'pro_annual' = 'pro_monthly') => {
    setBillingAction(true);
    Analytics.upgradeViewed('settings', 0);
    Analytics.beginCheckout(planId, planId === 'pro_annual' ? 72 : 9);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.code === 'billing_not_configured') {
        toast.error('Billing is not configured yet. Add Stripe keys to enable checkout.');
      } else {
        toast.error(data.error || 'Could not start checkout');
      }
    } catch {
      toast.error('Could not start checkout');
    } finally {
      setBillingAction(false);
    }
  };

  const openPortal = async () => {
    setBillingAction(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error || 'Could not open billing portal');
    } catch {
      toast.error('Could not open billing portal');
    } finally {
      setBillingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const isPro = billing?.planTier === 'pro';
  const isPaid = isPro;

  const aiPercent = billing?.aiUsage
    ? Math.min(100, Math.round((billing.aiUsage.used / Math.max(1, billing.aiUsage.limit)) * 100))
    : 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 pb-20">
      <Suspense fallback={null}>
        <BillingSuccessToast />
      </Suspense>

      <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-4">
          Account
        </h2>
        <div className="space-y-4 max-w-md">
          <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Button onClick={handleSaveProfile} disabled={saving} className="mt-2">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </Card>

      {/* Plan & Usage */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Plan & Entitlements</h2>
          {isPaid && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
              <Sparkles size={13} />
              Pro Active
            </span>
          )}
        </div>

        {billingLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Status Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-mono">Current Plan</p>
                <p className="text-2xl font-display font-medium text-[var(--text-primary)] mt-1">
                  {billing?.plan.name || 'Free'}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-light leading-relaxed">
                  {billing?.plan.headline}
                </p>

                {isPro && billing?.subscription?.currentPeriodEnd && (
                  <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
                    Renews on{' '}
                    {new Date(billing.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {billing.subscription.cancelAtPeriodEnd ? ' · Cancels at period end' : ''}
                  </p>
                )}
              </div>

              {/* AI Usage Meter */}
              <div className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
                      Monthly AI Reflections
                    </span>
                    <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
                      {billing?.aiUsage.used ?? 0} / {billing?.aiUsage.limit ?? 5}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                      style={{ width: `${aiPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                    {billing?.aiUsage.remaining ?? 0} reflections remaining this month. Resets monthly.
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Action Blocks */}
            {!isPaid ? (
              <div className="space-y-4">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-mono">
                  Upgrade to understand your dream archive over time
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pro Monthly */}
                  <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Monthly</span>
                      <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Pro Monthly</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-semibold text-[var(--text-primary)]">$9</span>
                        <span className="text-xs text-[var(--text-muted)]">/ mo</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                        100 AI reflections / mo, deep cross-dream pattern synthesis, and recurring motifs.
                      </p>
                    </div>
                    <Button onClick={() => startCheckout('pro_monthly')} disabled={billingAction} size="sm">
                      {billingAction ? 'Redirecting…' : 'Upgrade Monthly'}
                    </Button>
                  </div>

                  {/* Pro Annual */}
                  <div className="p-5 rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-card)] flex flex-col justify-between space-y-4 relative shadow-sm">
                    <div className="absolute -top-2.5 right-4 bg-[var(--accent)] text-[var(--bg-primary)] px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider">
                      Save 33%
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">Annual</span>
                      <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Pro Annual</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-semibold text-[var(--text-primary)]">$72</span>
                        <span className="text-xs text-[var(--text-muted)]">/ yr ($6/mo)</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                        The full Pro experience at $6/month equivalent, billed annually.
                      </p>
                    </div>
                    <Button onClick={() => startCheckout('pro_annual')} disabled={billingAction} size="sm">
                      {billingAction ? 'Redirecting…' : 'Upgrade Annual'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)]">Subscription Management</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Update your payment method, view invoices, or change subscription settings.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="secondary" onClick={openPortal} disabled={billingAction} size="sm">
                    {billingAction ? 'Opening…' : 'Manage subscription'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Appearance */}
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-4">
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === 'light'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sun className="mb-2" size={22} />
            <span className="text-xs">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Moon className="mb-2" size={22} />
            <span className="text-xs">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === 'system'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Monitor className="mb-2" size={22} />
            <span className="text-xs">System</span>
          </button>
        </div>
      </Card>

      {/* Account Session & Sign Out */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Account Session</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Currently signed in as <strong className="text-[var(--text-primary)]">{user?.email || 'Active Account'}</strong>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs hover:text-rose-500 hover:border-rose-500/30"
          >
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </Card>

      {/* Privacy & Data Ownership */}
      <Card className="p-6 space-y-6 border-rose-500/20">
        <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-4">
          <AlertTriangle className="text-rose-500" size={20} />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Privacy & Data Ownership</h2>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">Export Dream Archive</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Download your complete journal entries, transcripts, and metadata in open JSON or formatted Markdown.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" onClick={() => handleExportData('json')} className="flex gap-2 text-xs">
                <Download size={14} /> JSON
              </Button>
              <Button variant="secondary" onClick={() => handleExportData('markdown')} className="flex gap-2 text-xs">
                <Download size={14} /> Markdown (.md)
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <div>
              <h3 className="font-medium text-rose-600 dark:text-rose-400">Delete Account & Data</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Permanently erase your account, all recorded dreams, and all reflections. This cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              className="shrink-0 flex gap-2 text-xs"
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={14} /> Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-2xl space-y-5 text-[var(--text-primary)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-500 font-semibold">
                <AlertTriangle size={20} />
                <span>Delete Account</span>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              This action is permanent and immediate. All your recorded dreams, extracted symbols, reflections, and account access will be erased forever.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-muted)] block">
                Type <strong className="text-[var(--text-primary)] font-mono">DELETE</strong> below to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] font-mono outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || deletingAccount}
              >
                {deletingAccount ? 'Deleting…' : 'Permanently Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
