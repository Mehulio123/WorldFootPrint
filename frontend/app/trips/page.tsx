'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tripsApi, type Trip, type Segment } from '@/lib/api/trips';
import { placesApi, searchPlacesGlobal, mapboxFeatureToPlace, type PlaceResult } from '@/lib/api/places';

const TRANSPORT_MODES = [
  { value: 'flight', label: '✈️ Flight' },
  { value: 'train',  label: '🚂 Train'  },
  { value: 'car',    label: '🚗 Car'    },
  { value: 'bus',    label: '🚌 Bus'    },
  { value: 'ferry',  label: '⛴️ Ferry'  },
  { value: 'bike',   label: '🚴 Bike'   },
  { value: 'walk',   label: '🚶 Walk'   },
];

const TRANSPORT_EMOJI: Record<string, string> = {
  flight: '✈️', train: '🚂', car: '🚗',
  bus: '🚌', ferry: '⛴️', bike: '🚴', walk: '🚶',
};

// ── Reusable place search input (Mapbox Geocoding — every city in the world) ──
function PlaceSearch({
  placeholder,
  selected,
  onSelect,
}: {
  placeholder: string;
  selected: PlaceResult | null;
  onSelect: (place: PlaceResult | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ReturnType<typeof mapboxFeatureToPlace>[]>([]);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(val: string) {
    setQuery(val);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const features = await searchPlacesGlobal(val);
      setSuggestions(features.map(mapboxFeatureToPlace));
      setOpen(features.length > 0);
    }, 300);
  }

  async function choose(suggestion: ReturnType<typeof mapboxFeatureToPlace>) {
    setOpen(false);
    setQuery('');
    setResolving(true);
    try {
      // Register the place in the backend to get a database ID
      const place = await placesApi.findOrCreate(suggestion);
      onSelect(place);
    } catch {
      // Fallback: still let the user see it selected even if backend failed
      onSelect({ ...suggestion, id: '' });
    } finally {
      setResolving(false);
    }
  }

  if (resolving) {
    return (
      <div style={{ padding: '12px 14px', border: '1px solid #ded7cc', borderRadius: 10, fontSize: 13, fontFamily: 'Arial', color: '#8a7060' }}>
        Saving place...
      </div>
    );
  }

  if (selected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0ebe3', border: '1px solid #ded7cc', borderRadius: 10, padding: '10px 14px' }}>
        <span style={{ flex: 1, fontSize: 14, color: '#4b2e22', fontFamily: 'Arial' }}>
          {selected.displayName ?? `${selected.name}, ${selected.countryName}`}
        </span>
        <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', color: '#b9853f', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ded7cc', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => choose(s)}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#4b2e22', fontFamily: 'Arial', borderBottom: '1px solid #f0ebe3' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8f4ee')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              {s.displayName ?? `${s.name}, ${s.countryName}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add trip form
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: '', description: '', startDate: '', endDate: '', isPublic: false });
  const [savingTrip, setSavingTrip] = useState(false);
  const [tripError, setTripError] = useState('');

  // Add segment — tracks which trip the form is open for
  const [segmentTripId, setSegmentTripId] = useState<string | null>(null);
  const [segmentMode, setSegmentMode] = useState('flight');
  const [segmentNotes, setSegmentNotes] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<PlaceResult | null>(null);
  const [selectedDest, setSelectedDest] = useState<PlaceResult | null>(null);
  const [savingSegment, setSavingSegment] = useState(false);
  const [segmentError, setSegmentError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      const data = await tripsApi.getAll();
      setTrips(data);
    } catch {
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!newTrip.title.trim()) { setTripError('Title is required'); return; }
    setSavingTrip(true);
    setTripError('');
    try {
      const created = await tripsApi.create({
        title: newTrip.title.trim(),
        description: newTrip.description || undefined,
        startDate: newTrip.startDate || undefined,
        endDate: newTrip.endDate || undefined,
        isPublic: newTrip.isPublic,
      });
      setTrips(prev => [{ ...created, segments: [] }, ...prev]);
      setNewTrip({ title: '', description: '', startDate: '', endDate: '', isPublic: false });
      setShowAddTrip(false);
    } catch {
      setTripError('Failed to create trip');
    } finally {
      setSavingTrip(false);
    }
  }

  async function handleDeleteTrip(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" and all its segments?`)) return;
    try {
      await tripsApi.delete(id);
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('Failed to delete trip');
    }
  }

  function openAddSegment(tripId: string) {
    setSegmentTripId(tripId);
    setSegmentMode('flight');
    setSegmentNotes('');
    setSelectedOrigin(null);
    setSelectedDest(null);
    setSegmentError('');
  }

  async function handleAddSegment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrigin) { setSegmentError('Select an origin city'); return; }
    if (!selectedDest)   { setSegmentError('Select a destination city'); return; }
    if (selectedOrigin.id === selectedDest.id) { setSegmentError('Origin and destination must be different'); return; }
    setSavingSegment(true);
    setSegmentError('');
    try {
      const seg = await tripsApi.addSegment(segmentTripId!, {
        originId: selectedOrigin.id,
        destinationId: selectedDest.id,
        transportMode: segmentMode,
        notes: segmentNotes || undefined,
      });
      setTrips(prev => prev.map(t =>
        t.id === segmentTripId ? { ...t, segments: [...t.segments, seg as Segment] } : t
      ));
      setSegmentTripId(null);
    } catch {
      setSegmentError('Failed to add segment');
    } finally {
      setSavingSegment(false);
    }
  }

  async function handleDeleteSegment(tripId: string, segmentId: string) {
    if (!window.confirm('Remove this segment?')) return;
    try {
      await tripsApi.deleteSegment(segmentId);
      setTrips(prev => prev.map(t =>
        t.id === tripId ? { ...t, segments: t.segments.filter(s => s.id !== segmentId) } : t
      ));
    } catch {
      alert('Failed to delete segment');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', color: '#b9853f', fontSize: 18 }}>Loading your trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Arial', color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f7f4ec 0%, #efe7da 100%)', padding: '40px 24px', fontFamily: 'Georgia, serif', color: '#4b2e22' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/map-user"
              className="btn-pill"
              style={{
                color: '#7a5738', border: '1px solid rgba(170,140,95,0.3)',
                borderRadius: 999, padding: '8px 18px', textDecoration: 'none',
                fontFamily: 'Arial, sans-serif', fontSize: 14,
              }}
            >
              ← Map
            </Link>
            <h1 style={{ fontSize: 36, fontWeight: 500, margin: 0 }}>My Trips</h1>
          </div>
          <button onClick={() => { setShowAddTrip(v => !v); setTripError(''); }} style={showAddTrip ? secondaryBtnStyle : primaryBtnStyle}>
            {showAddTrip ? 'Cancel' : '+ Add Trip'}
          </button>
        </div>

        {/* Add Trip Form */}
        {showAddTrip && (
          <form onSubmit={handleCreateTrip} style={cardStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: 22 }}>New Trip</h2>
            {tripError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontFamily: 'Arial' }}>{tripError}</p>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={newTrip.title} onChange={e => setNewTrip(p => ({ ...p, title: e.target.value }))} placeholder="e.g. European Summer 2025" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input value={newTrip.description} onChange={e => setNewTrip(p => ({ ...p, description: e.target.value }))} placeholder="Optional notes" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={newTrip.startDate} onChange={e => setNewTrip(p => ({ ...p, startDate: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" value={newTrip.endDate} onChange={e => setNewTrip(p => ({ ...p, endDate: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Arial', fontSize: 14, color: '#6a584d', cursor: 'pointer' }}>
                <input type="checkbox" checked={newTrip.isPublic} onChange={e => setNewTrip(p => ({ ...p, isPublic: e.target.checked }))} />
                Make this trip public
              </label>
              <button type="submit" disabled={savingTrip} style={{ ...primaryBtnStyle, opacity: savingTrip ? 0.7 : 1 }}>
                {savingTrip ? 'Creating...' : 'Create Trip'}
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a7060' }}>
            <p style={{ fontSize: 20, margin: '0 0 8px' }}>No trips yet</p>
            <p style={{ fontSize: 14, fontFamily: 'Arial' }}>Add your first trip to start tracking your footprint</p>
          </div>
        )}

        {/* Trip Cards */}
        <div style={{ display: 'grid', gap: 20 }}>
          {trips.map(trip => (
            <div key={trip.id} style={cardStyle}>

              {/* Trip header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{trip.title}</h2>
                  {(trip.startDate || trip.endDate) && (
                    <p style={{ margin: 0, fontSize: 13, fontFamily: 'Arial', color: '#8a7060' }}>
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '?'}
                      {' → '}
                      {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '?'}
                    </p>
                  )}
                  {trip.description && (
                    <p style={{ margin: '4px 0 0', fontSize: 13, fontFamily: 'Arial', color: '#8a7060' }}>{trip.description}</p>
                  )}
                </div>
                <button onClick={() => handleDeleteTrip(trip.id, trip.title)} style={deleteBtnStyle} title="Delete trip">✕</button>
              </div>

              {/* Segments */}
              {trip.segments.length > 0 && (
                <div style={{ marginBottom: 16, display: 'grid', gap: 8 }}>
                  {trip.segments.map(seg => (
                    <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f4ee', borderRadius: 8, padding: '8px 12px' }}>
                      <span style={{ fontSize: 16 }}>{TRANSPORT_EMOJI[seg.transportMode] ?? '🗺️'}</span>
                      <span style={{ flex: 1, fontSize: 13, fontFamily: 'Arial', color: '#4b2e22' }}>
                        {seg.origin.name} → {seg.destination.name}
                      </span>
                      {seg.distance && (
                        <span style={{ fontSize: 12, fontFamily: 'Arial', color: '#8a7060' }}>{seg.distance.toLocaleString()} km</span>
                      )}
                      <button onClick={() => handleDeleteSegment(trip.id, seg.id)} style={{ background: 'none', border: 'none', color: '#b9853f', cursor: 'pointer', fontSize: 13, padding: '0 4px' }} title="Remove segment">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Segment Form */}
              {segmentTripId === trip.id ? (
                <form onSubmit={handleAddSegment} style={{ borderTop: '1px solid #ece7de', paddingTop: 16, display: 'grid', gap: 12 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Add Segment</p>
                  {segmentError && <p style={{ color: '#dc2626', fontSize: 13, margin: 0, fontFamily: 'Arial' }}>{segmentError}</p>}
                  <div>
                    <label style={labelStyle}>Origin</label>
                    <PlaceSearch placeholder="Search city or country..." selected={selectedOrigin} onSelect={setSelectedOrigin} />
                  </div>
                  <div>
                    <label style={labelStyle}>Destination</label>
                    <PlaceSearch placeholder="Search city or country..." selected={selectedDest} onSelect={setSelectedDest} />
                  </div>
                  <div>
                    <label style={labelStyle}>Transport Mode</label>
                    <select value={segmentMode} onChange={e => setSegmentMode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {TRANSPORT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Notes (optional)</label>
                    <input value={segmentNotes} onChange={e => setSegmentNotes(e.target.value)} placeholder="Any notes about this leg..." style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={savingSegment} style={{ ...primaryBtnStyle, flex: 1, opacity: savingSegment ? 0.7 : 1 }}>
                      {savingSegment ? 'Adding...' : 'Add Segment'}
                    </button>
                    <button type="button" onClick={() => setSegmentTripId(null)} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => openAddSegment(trip.id)} style={{ ...secondaryBtnStyle, width: '100%', fontSize: 14 }}>
                  + Add Segment
                </button>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'rgba(255,250,242,0.82)',
  borderRadius: 20,
  padding: 24,
  boxShadow: '0 4px 14px rgba(85,60,30,0.07)',
  border: '1px solid rgba(180,150,100,0.2)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #ded7cc',
  background: '#fff',
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  color: '#4b2e22',
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  color: '#6a584d',
  fontFamily: 'Arial, sans-serif',
};

const primaryBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #c9893a 0%, #9e6422 60%, #b5782a 100%)',
  color: '#fffdf8',
  padding: '12px 22px',
  borderRadius: 12,
  border: '1px solid rgba(123,79,25,0.35)',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Arial, sans-serif',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 12px rgba(80,50,20,0.15)',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  color: '#6b5a4c',
  border: '1.5px solid rgba(180,150,100,0.3)',
  padding: '12px 22px',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Arial, sans-serif',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#c0a08a',
  cursor: 'pointer',
  fontSize: 18,
  padding: 4,
  lineHeight: 1,
  flexShrink: 0,
  transition: 'color 0.15s ease, transform 0.15s ease',
};
