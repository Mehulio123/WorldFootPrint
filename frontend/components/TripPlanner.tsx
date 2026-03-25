'use client';

import { useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface ItineraryDay {
  day: number;
  title: string;
  location: string;
  description: string;
  activities: string[];
}

interface Package {
  tier: 'Budget' | 'Mid-Range' | 'Luxury';
  name: string;
  pricePerPerson: string;
  duration: string;
  includes: string[];
  accommodation: string;
  highlights: string;
}

interface TripPlan {
  destination: string;
  region: string;
  tagline: string;
  why: string;
  duration: string;
  bestTimeToVisit: string;
  overview: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  packages: Package[];
  practicalTips: string[];
  visaInfo: string;
  currency: string;
}

type Budget = 'budget' | 'mid-range' | 'luxury';

/* ── Loading messages ───────────────────────────────────────────────────────── */
const LOADING_MESSAGES = [
  'Scanning the globe for unexplored territory...',
  'Consulting ancient maps and modern wanderers...',
  'Finding where adventure meets authenticity...',
  'Crafting your personalised itinerary...',
  'Negotiating the best package deals...',
  'Almost ready — your next adventure awaits...',
];

/* ── Tier colours ───────────────────────────────────────────────────────────── */
const TIER_STYLE: Record<string, { border: string; badge: string; label: string }> = {
  Budget:      { border: '1px solid rgba(92,138,108,0.5)',  badge: 'rgba(92,138,108,0.18)',  label: '#6dbf8a' },
  'Mid-Range': { border: '1px solid rgba(181,121,42,0.5)',  badge: 'rgba(181,121,42,0.18)',  label: '#d4ac68' },
  Luxury:      { border: '1px solid rgba(200,160,80,0.6)',  badge: 'rgba(200,160,80,0.15)',  label: '#f0c060' },
};

const BUDGET_OPTIONS: { id: Budget; label: string; icon: string; color: string; active: string }[] = [
  { id: 'budget',     label: 'Budget',    icon: '🎒', color: 'rgba(92,138,108,0.12)',   active: 'rgba(92,138,108,0.28)'  },
  { id: 'mid-range',  label: 'Mid-Range', icon: '✈️', color: 'rgba(181,121,42,0.12)',   active: 'rgba(181,121,42,0.28)'  },
  { id: 'luxury',     label: 'Luxury',    icon: '🥂', color: 'rgba(200,160,80,0.12)',   active: 'rgba(200,160,80,0.25)'  },
];

function durationLabel(days: number): string {
  if (days <= 7) return `${days} days`;
  if (days <= 14) return `${days} days · ~${Math.round(days / 7)} week${days > 7 ? 's' : ''}`;
  return `${days} days · ~${(days / 7).toFixed(1)} weeks`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════════ */
export function TripPlanner({
  visitedCountries,
  visitedCount,
}: {
  visitedCountries: string[];
  visitedCount: number;
}) {
  const [state, setState]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [plan, setPlan]       = useState<TripPlan | null>(null);
  const [loadingMsg, setMsg]  = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [errorMsg, setError]  = useState('');

  // Preferences
  const [budget, setBudget]     = useState<Budget>('mid-range');
  const [tripDays, setTripDays] = useState(7);

  async function generate() {
    setState('loading');
    setMsg(0);

    const interval = setInterval(() => setMsg((p) => (p + 1) % LOADING_MESSAGES.length), 2600);

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitedCountries, budget, tripDays }),
      });
      clearInterval(interval);
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as TripPlan & { error?: string };
      if (data.error) throw new Error(data.error);
      setPlan(data);
      setState('done');
      setOpenDay(1);
    } catch (e: unknown) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setState('error');
    }
  }

  /* ── Idle / Preferences ───────────────────────────────────────────────────── */
  if (state === 'idle') {
    const activeBudget = BUDGET_OPTIONS.find(b => b.id === budget)!;
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0c1a',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '48px 20px', gap: 0,
      }}>
        <style>{`
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          input[type=range].trip-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(to right, #f0a030 0%, #f0a030 var(--pct), rgba(255,255,255,0.1) var(--pct), rgba(255,255,255,0.1) 100%); outline: none; cursor: pointer; }
          input[type=range].trip-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #f0a030; border: 2px solid #1a1205; box-shadow: 0 0 8px rgba(240,160,48,0.5); cursor: pointer; }
          input[type=range].trip-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #f0a030; border: 2px solid #1a1205; box-shadow: 0 0 8px rgba(240,160,48,0.5); cursor: pointer; }
        `}</style>

        {/* Globe */}
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 28, animation: 'float 4s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(240,160,48,0.3))' }}>
          🌍
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: 'clamp(26px,5vw,40px)',
          color: '#f5deb3', fontWeight: 700, margin: '0 0 10px', textAlign: 'center', letterSpacing: '-0.5px',
        }}>
          Plan Your Next Adventure
        </h1>
        <p style={{ color: 'rgba(245,222,179,0.45)', fontSize: 15, margin: '0 0 36px', textAlign: 'center', maxWidth: 480, lineHeight: 1.6 }}>
          Tell us your preferences and AI will find a destination you've never explored — complete with an itinerary and curated packages.
        </p>

        {/* Preferences card */}
        <div style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,160,48,0.12)',
          borderRadius: 20, padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 28,
        }}>

          {/* Visited badge */}
          {visitedCount > 0 && (
            <div style={{
              background: 'rgba(240,160,48,0.07)', border: '1px solid rgba(240,160,48,0.15)',
              borderRadius: 10, padding: '10px 16px', textAlign: 'center',
            }}>
              <span style={{ color: 'rgba(212,172,104,0.8)', fontSize: 13 }}>
                Avoiding your <strong style={{ color: '#d4ac68' }}>{visitedCount} visited {visitedCount === 1 ? 'country' : 'countries'}</strong> — we'll find somewhere new.
              </span>
            </div>
          )}

          {/* Budget selector */}
          <div>
            <label style={{ color: 'rgba(245,222,179,0.5)', fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              Budget
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {BUDGET_OPTIONS.map(opt => {
                const isActive = budget === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setBudget(opt.id)}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                      background: isActive ? opt.active : opt.color,
                      border: isActive ? '1px solid rgba(240,160,48,0.4)' : '1px solid rgba(255,255,255,0.07)',
                      color: isActive ? '#f5deb3' : 'rgba(245,222,179,0.4)',
                      fontSize: 13, fontFamily: 'Arial, sans-serif',
                      transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <label style={{ color: 'rgba(245,222,179,0.5)', fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase' }}>
                Duration
              </label>
              <span style={{ color: '#f0a030', fontWeight: 700, fontSize: 15, fontFamily: 'Georgia, serif' }}>
                {durationLabel(tripDays)}
              </span>
            </div>
            <input
              type="range"
              className="trip-slider"
              min={5} max={21} step={1}
              value={tripDays}
              style={{ '--pct': `${((tripDays - 5) / 16) * 100}%` } as React.CSSProperties}
              onChange={e => setTripDays(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ color: 'rgba(245,222,179,0.25)', fontSize: 11 }}>5 days</span>
              <span style={{ color: 'rgba(245,222,179,0.25)', fontSize: 11 }}>3 weeks</span>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            style={{
              background: 'linear-gradient(135deg, #c9893a 0%, #f0a030 60%, #d4ac68 100%)',
              border: 'none', borderRadius: 14, padding: '15px 32px',
              fontSize: 16, fontWeight: 700, color: '#1a1205', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(240,160,48,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              letterSpacing: '0.2px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { (e.currentTarget).style.transform = 'scale(1.02)'; (e.currentTarget).style.boxShadow = '0 6px 28px rgba(240,160,48,0.5)'; }}
            onMouseLeave={e => { (e.currentTarget).style.transform = 'scale(1)'; (e.currentTarget).style.boxShadow = '0 4px 20px rgba(240,160,48,0.35)'; }}
          >
            <span style={{ fontSize: 18 }}>✦</span>
            Generate My Adventure
          </button>
        </div>

        {visitedCount === 0 && (
          <p style={{ color: 'rgba(245,222,179,0.25)', fontSize: 13, textAlign: 'center', maxWidth: 360, marginTop: 20 }}>
            No trips logged yet? No problem — we'll suggest an incredible first adventure.
          </p>
        )}
      </div>
    );
  }

  /* ── Loading ──────────────────────────────────────────────────────────────── */
  if (state === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0c1a',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 32, padding: 40,
      }}>
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(240,160,48,0.12)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#f0a030', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#d4ac68', animation: 'spin 1.6s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✈️</div>
        </div>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: '#d4ac68', fontSize: 17, fontFamily: 'Georgia, serif', minHeight: 28 }}>
            {LOADING_MESSAGES[loadingMsg]}
          </p>
          <p style={{ color: 'rgba(245,222,179,0.3)', fontSize: 13, marginTop: 8 }}>
            This usually takes 10–20 seconds
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────────── */
  if (state === 'error') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0c1a',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 20, padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ color: '#f5deb3', fontSize: 18, fontFamily: 'Georgia, serif' }}>Something went wrong</p>
        <p style={{ color: 'rgba(245,222,179,0.55)', fontSize: 13, maxWidth: 480, lineHeight: 1.6, background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 8, padding: '10px 16px' }}>{errorMsg}</p>
        <button onClick={() => setState('idle')} style={{
          background: 'transparent', border: '1px solid rgba(240,160,48,0.4)',
          borderRadius: 50, padding: '10px 28px', color: '#d4ac68',
          fontSize: 14, cursor: 'pointer',
        }}>Try Again</button>
      </div>
    );
  }

  /* ── Result ───────────────────────────────────────────────────────────────── */
  if (!plan) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0c1a', color: '#f5deb3', fontFamily: 'Arial, sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1530 0%, #0d0c1a 100%)',
        borderBottom: '1px solid rgba(240,160,48,0.12)',
        padding: '48px 24px 40px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(240,160,48,0.12)',
          border: '1px solid rgba(240,160,48,0.25)', borderRadius: 50,
          padding: '4px 16px', fontSize: 12, color: '#d4ac68',
          letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16,
        }}>
          {plan.region}
        </div>
        <h1 style={{
          fontSize: 'clamp(32px,6vw,52px)', fontFamily: 'Georgia, serif',
          fontWeight: 700, color: '#fff', margin: '0 0 12px',
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {plan.destination}
        </h1>
        <p style={{ fontSize: 18, color: '#d4ac68', fontStyle: 'italic', margin: '0 0 24px' }}>
          "{plan.tagline}"
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '🗓', label: plan.duration },
            { icon: '🌤', label: plan.bestTimeToVisit },
            { icon: '💱', label: plan.currency },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(245,222,179,0.8)',
            }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Why this trip ──────────────────────────────────────────────────── */}
        <Section title="Why This Trip For You">
          <p style={{ color: 'rgba(245,222,179,0.75)', lineHeight: 1.75, fontSize: 15, margin: 0 }}>
            {plan.why}
          </p>
        </Section>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        <Section title="Overview">
          <p style={{ color: 'rgba(245,222,179,0.75)', lineHeight: 1.75, fontSize: 15, margin: '0 0 20px' }}>
            {plan.overview}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {plan.highlights.map((h) => (
              <span key={h} style={{
                background: 'rgba(181,121,42,0.15)', border: '1px solid rgba(181,121,42,0.3)',
                borderRadius: 50, padding: '5px 14px', fontSize: 13, color: '#d4ac68',
              }}>
                ✦ {h}
              </span>
            ))}
          </div>
        </Section>

        {/* ── Itinerary ─────────────────────────────────────────────────────── */}
        <Section title={`${plan.itinerary.length}-Day Itinerary`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.itinerary.map((day) => (
              <div
                key={day.day}
                style={{
                  background: openDay === day.day ? 'rgba(240,160,48,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${openDay === day.day ? 'rgba(240,160,48,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10, overflow: 'hidden', transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                  style={{
                    width: '100%', padding: '14px 18px', background: 'transparent', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                  }}
                >
                  <span style={{
                    minWidth: 36, height: 36, borderRadius: '50%',
                    background: openDay === day.day ? 'rgba(240,160,48,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${openDay === day.day ? 'rgba(240,160,48,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: openDay === day.day ? '#f0a030' : 'rgba(245,222,179,0.5)',
                  }}>
                    {day.day}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: openDay === day.day ? '#f5deb3' : 'rgba(245,222,179,0.8)' }}>
                      {day.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(245,222,179,0.4)', marginTop: 2 }}>
                      📍 {day.location}
                    </div>
                  </div>
                  <span style={{
                    color: 'rgba(245,222,179,0.3)', fontSize: 18, transition: 'transform 0.2s',
                    transform: openDay === day.day ? 'rotate(180deg)' : 'none',
                  }}>⌄</span>
                </button>

                {openDay === day.day && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: 'rgba(245,222,179,0.7)', fontSize: 14, lineHeight: 1.7, margin: '14px 0 12px' }}>
                      {day.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {day.activities.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: '#f0a030', fontSize: 11, marginTop: 3 }}>▸</span>
                          <span style={{ color: 'rgba(245,222,179,0.65)', fontSize: 13 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Packages ──────────────────────────────────────────────────────── */}
        <Section title="Package Deals">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {plan.packages.map((pkg) => {
              const ts = TIER_STYLE[pkg.tier] ?? TIER_STYLE['Mid-Range'];
              return (
                <div key={pkg.tier} style={{
                  background: 'rgba(255,255,255,0.02)', border: ts.border,
                  borderRadius: 14, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      background: ts.badge, border: ts.border, borderRadius: 50,
                      padding: '3px 12px', fontSize: 11, fontWeight: 700,
                      color: ts.label, textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                      {pkg.tier}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: ts.label, fontWeight: 700, fontSize: 16 }}>{pkg.pricePerPerson}</div>
                      <div style={{ color: 'rgba(245,222,179,0.35)', fontSize: 11 }}>per person</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#f5deb3', marginBottom: 4 }}>{pkg.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(245,222,179,0.4)' }}>🏨 {pkg.accommodation}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {pkg.includes.map((item) => (
                      <div key={item} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                        <span style={{ color: ts.label, fontSize: 10, marginTop: 4 }}>✓</span>
                        <span style={{ color: 'rgba(245,222,179,0.6)', fontSize: 12 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: 'auto', paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(245,222,179,0.55)', fontSize: 12, lineHeight: 1.5, fontStyle: 'italic',
                  }}>
                    {pkg.highlights}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Practical Tips ─────────────────────────────────────────────────── */}
        <Section title="Practical Tips">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plan.practicalTips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ color: '#f0a030', fontWeight: 700, fontSize: 13, minWidth: 20 }}>{i + 1}.</span>
                <span style={{ color: 'rgba(245,222,179,0.7)', fontSize: 14, lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, background: 'rgba(240,160,48,0.05)',
            border: '1px solid rgba(240,160,48,0.15)', borderRadius: 8, padding: '12px 16px',
            display: 'flex', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🛂</span>
            <div>
              <div style={{ color: '#d4ac68', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Visa Info</div>
              <div style={{ color: 'rgba(245,222,179,0.6)', fontSize: 13 }}>{plan.visaInfo}</div>
            </div>
          </div>
        </Section>

        {/* ── Generate Again ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => { setPlan(null); setState('idle'); }}
            style={{
              background: 'transparent', border: '1px solid rgba(240,160,48,0.35)',
              borderRadius: 50, padding: '12px 32px', color: '#d4ac68',
              fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(240,160,48,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
          >
            ↻ Plan Another Adventure
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable section wrapper ─────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700,
          color: '#f5deb3', margin: 0, whiteSpace: 'nowrap',
        }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(240,160,48,0.3), transparent)' }} />
      </div>
      {children}
    </div>
  );
}
