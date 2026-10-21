import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  Home,
  X,
  CheckCircle2,
  Building2,
  Compass,
  ArrowLeft,
  Star,
  ShieldCheck,
  Utensils,
  Wifi,
  Wind,
  Navigation,
  SlidersHorizontal,
  Users,
  User,
  Clock,
  ArrowUpDown,
  Building,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { College, PgListing } from '@/types';
import { DEFAULT_COLLEGES, getMockPgsForCollege, TOTAL_PGS_COUNT } from '@/lib/mockData';
import MicroSlats from './components/MicroSlats';
import SwipeToRedirect from './components/SwipeToRedirect';

function CollegeSearchBar({
  colleges,
  selectedCollege,
  onSelect,
  placeholder = 'Search among 385 Bangalore colleges...',
  autoFocus = false,
  compact = false,
}: {
  colleges: College[];
  selectedCollege: College | null;
  onSelect: (college: College) => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return colleges;
    const q = query.toLowerCase().trim();
    const cleanQ = q.replace(/[\s\.\-_]/g, '');
    return colleges.filter((c) => {
      const name = c.name.toLowerCase();
      const area = (c.area || '').toLowerCase();
      const cleanName = name.replace(/[\s\.\-_]/g, '');
      const cleanArea = area.replace(/[\s\.\-_]/g, '');

      return (
        name.includes(q) ||
        area.includes(q) ||
        cleanName.includes(cleanQ) ||
        cleanArea.includes(cleanQ) ||
        (cleanQ.includes('drait') && (cleanName.includes('drait') || name.includes('ambedkar')))
      );
    });
  }, [query, colleges]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(college: College) {
    onSelect(college);
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && filtered[highlightIndex]) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/80 transition-colors ${
            compact ? 'h-4 w-4' : 'h-5 w-5'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-purple-500/35 bg-zinc-950/85 text-white shadow-2xl shadow-purple-950/40 outline-none backdrop-blur-xl transition-all duration-200 placeholder:text-zinc-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 ${
            compact ? 'py-2.5 pl-10 pr-9 text-xs' : 'py-4 pl-12 pr-11 text-sm font-medium'
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-purple-500/35 bg-zinc-950/98 py-2 shadow-2xl shadow-black/90 backdrop-blur-2xl scrollbar-thin">
          <div className="flex items-center justify-between border-b border-purple-950/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-purple-300/80">
            <span>
              {filtered.length} {filtered.length === 1 ? 'College' : 'Colleges'} Found
            </span>
            <span className="text-[10px] normal-case text-zinc-500">Click to view 5 PGs</span>
          </div>
          {filtered.slice(0, 50).map((college, idx) => (
            <button
              key={college.id}
              onClick={() => handleSelect(college)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                idx === highlightIndex
                  ? 'bg-purple-900/50 text-white'
                  : 'text-zinc-200 hover:bg-purple-950/60 hover:text-white'
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-purple-800/40 bg-purple-950/70 text-purple-300">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{college.name}</p>
                <p className="truncate text-xs text-purple-300/70">{college.area || 'Bangalore'}</p>
              </div>
              <span className="flex-shrink-0 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                5 PGs
              </span>
              {selectedCollege?.id === college.id && (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-purple-400" />
              )}
            </button>
          ))}
          {filtered.length > 50 && (
            <div className="border-t border-purple-950/60 bg-zinc-900/60 px-4 py-2.5 text-center text-xs font-medium text-zinc-400">
              Showing top 50 of {filtered.length} colleges — type more letters to filter
            </div>
          )}
        </div>
      )}

      {isOpen && filtered.length === 0 && query && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-purple-500/30 bg-zinc-950/98 py-6 text-center shadow-2xl backdrop-blur-2xl">
          <p className="text-sm text-zinc-400">No colleges found matching "{query}"</p>
        </div>
      )}
    </div>
  );
}

// PG Card Component (Strictly NO photos, sleek typography, badges, amenities & interactive redirection swipe)
function PgCard({ pg, college }: { pg: PgListing; college: College }) {
  const genderColors = {
    Ladies: {
      badge: 'border-fuchsia-500/40 bg-fuchsia-950/70 text-fuchsia-300 shadow-fuchsia-950/40',
      icon: <User className="h-3.5 w-3.5" />,
      tag: 'Ladies Only',
    },
    Gents: {
      badge: 'border-blue-500/40 bg-blue-950/70 text-blue-300 shadow-blue-950/40',
      icon: <User className="h-3.5 w-3.5" />,
      tag: 'Gents Only',
    },
    Coliving: {
      badge: 'border-purple-500/40 bg-purple-950/70 text-purple-300 shadow-purple-950/40',
      icon: <Users className="h-3.5 w-3.5" />,
      tag: 'Co-Living',
    },
  }[pg.gender];

  const estimatedWalkingMinutes = Math.max(2, Math.round(pg.distance_km * 12));

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/30 bg-zinc-950/85 p-6 shadow-xl shadow-purple-950/20 backdrop-blur-2xl transition-all duration-300 hover:border-purple-400/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.22)]">
      {/* Ambient Inner Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-purple-600/10 blur-3xl transition-opacity group-hover:opacity-100" />

      {/* Top Header Row: Gender, Distance & Verified Tag */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-950/50 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${genderColors.badge}`}
            >
              {genderColors.icon}
              {genderColors.tag}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified Stay
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-purple-300/80">
            <Navigation className="h-3.5 w-3.5 text-purple-400" />
            <span>
              {pg.distance_km} km ({estimatedWalkingMinutes} min walk)
            </span>
          </div>
        </div>

        {/* PG Name & Locality */}
        <div className="mt-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-purple-200">
                {pg.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                <span>
                  {pg.area || college.area || 'Bangalore'} • Near {college.name.split('(')[0].trim()}
                </span>
              </p>
            </div>

            {/* Rating pill */}
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-950/60 px-2.5 py-1 text-xs font-bold text-amber-300 shadow-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{pg.rating}</span>
              </div>
              <span className="mt-0.5 text-[10px] text-zinc-400">
                ({pg.reviews_count || 50}+ reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Rent & Deposit Details Box */}
        <div className="mt-5 rounded-2xl border border-purple-500/20 bg-zinc-900/60 p-3.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-zinc-400">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">
                  ₹{pg.rent.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-purple-300/80">/ month</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-full bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                Zero Brokerage
              </span>
              <p className="mt-1 text-[11px] text-zinc-400">
                Deposit: {pg.deposit ? `₹${pg.deposit.toLocaleString('en-IN')}` : '1 Month'}
              </p>
            </div>
          </div>

          {/* Sharing options */}
          <div className="mt-2.5 flex items-center gap-2 border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-300">
            <span className="text-zinc-400">Occupancy:</span>
            <span className="font-medium text-purple-200">
              {pg.sharing ? pg.sharing.join(' • ') : 'Single • Double • Triple'}
            </span>
          </div>
        </div>

        {/* Food Included Banner */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2 text-xs font-medium text-purple-200">
          <Utensils className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <span>3 Times Hygienic Meals Included (Breakfast, Lunch, Dinner)</span>
        </div>

        {/* Amenities Pills Grid */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Amenities & Features
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pg.amenities.slice(0, 6).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] text-zinc-300"
              >
                {amenity.includes('WiFi') ? (
                  <Wifi className="h-3 w-3 text-purple-400" />
                ) : amenity.includes('AC') ? (
                  <Wind className="h-3 w-3 text-purple-400" />
                ) : (
                  <Sparkles className="h-3 w-3 text-purple-400" />
                )}
                <span>{amenity}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action: Redirection Swipe Component */}
      <div className="mt-6 border-t border-purple-950/50 pt-5">
        <SwipeToRedirect
          url={
            pg.google_url ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              pg.name + ', ' + (pg.area || college.area || 'Bangalore')
            )}`
          }
          searchUrl={
            pg.google_search_url ||
            `https://www.google.com/search?q=${encodeURIComponent(
              pg.name + ' ' + (pg.area || college.area || 'Bangalore') + ' Bangalore reviews photos'
            )}`
          }
          pgName={pg.name}
          collegeName={college.name}
          area={pg.area || college.area}
          label="Slide to Open on Google Maps & Share"
        />
      </div>
    </div>
  );
}

function App() {
  const [colleges, setColleges] = useState<College[]>(DEFAULT_COLLEGES);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'college-pgs'>('landing');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'unconfigured' | 'error'>('unconfigured');

  // PG listing filters for the selected college
  const [genderFilter, setGenderFilter] = useState<'All' | 'Ladies' | 'Gents' | 'Coliving'>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'rent-asc' | 'rent-desc' | 'rating'>('distance');

  // Supabase colleges fetch or fallback
  useEffect(() => {
    async function loadColleges() {
      try {
        if (isSupabaseConfigured) {
          const { data, error: err } = await supabase
            .from('colleges')
            .select('*')
            .order('name')
            .limit(1000);
          if (!err && data && data.length >= DEFAULT_COLLEGES.length) {
            setColleges(data as College[]);
            setDbStatus('connected');
            return;
          }
        }
        setColleges(DEFAULT_COLLEGES);
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
        setColleges(DEFAULT_COLLEGES);
      }
    }
    loadColleges();
  }, []);

  // Sync with URL Hash (#college/col-xxx)
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      if (hash.startsWith('#college/')) {
        const collegeId = hash.replace('#college/', '').trim();
        const found = colleges.find((c) => c.id === collegeId);
        if (found) {
          setSelectedCollege(found);
          setActiveView('college-pgs');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      if (!hash || hash === '#' || hash === '#home') {
        setSelectedCollege(null);
        setActiveView('landing');
      }
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [colleges]);

  // Navigate to College Page
  function handleSelectCollege(college: College) {
    setSelectedCollege(college);
    setActiveView('college-pgs');
    setGenderFilter('All');
    setSortBy('distance');
    window.location.hash = `#college/${college.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Navigate back to Landing Search
  function handleBackToLanding() {
    setSelectedCollege(null);
    setActiveView('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Get PGs for the selected college (minimum 5 PGs guaranteed)
  const currentPgs = useMemo(() => {
    if (!selectedCollege) return [];
    return getMockPgsForCollege(selectedCollege);
  }, [selectedCollege]);

  // Filtered & Sorted PGs
  const displayedPgs = useMemo(() => {
    let list = [...currentPgs];

    if (genderFilter !== 'All') {
      list = list.filter((pg) => pg.gender === genderFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'distance') return a.distance_km - b.distance_km;
      if (sortBy === 'rent-asc') return a.rent - b.rent;
      if (sortBy === 'rent-desc') return b.rent - a.rent;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    return list;
  }, [currentPgs, genderFilter, sortBy]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Full-Page Fixed MicroSlats Background */}
      <div className="fixed inset-0 h-full w-full pointer-events-none z-0">
        <MicroSlats
          preset="swell"
          color="#A855F7"
          glintColor="#ffffff"
          backgroundColor="#000000"
          slatWidth={10}
          slatHeight={25}
          gap={3}
          roundness={0.75}
          interactive
          cursorStrength={1}
          cursorSize={40}
          swirl={0}
          trail={1.4}
          lean={0}
          intro
        />
      </div>

      {/* Global Ambient Dark Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85 pointer-events-none z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 border-b border-purple-900/30 bg-black/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToLanding}
                className="flex items-center gap-3 text-left transition-transform hover:scale-[1.02]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-700 to-fuchsia-600 shadow-lg shadow-purple-600/30">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                    SKOLAR
                  </h1>
                  <p className="hidden text-[11px] font-medium text-purple-300/70 sm:block">
                    Bangalore Student Living
                  </p>
                </div>
              </button>
            </div>

            {/* If in college-pgs view, show mini search or back button */}
            {activeView === 'college-pgs' && (
              <div className="hidden md:block w-80">
                <CollegeSearchBar
                  colleges={colleges}
                  selectedCollege={selectedCollege}
                  onSelect={handleSelectCollege}
                  placeholder="Switch college..."
                  compact
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              {activeView === 'college-pgs' ? (
                <button
                  onClick={handleBackToLanding}
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/60 px-3.5 py-1.5 text-xs font-semibold text-purple-200 transition-all hover:bg-purple-900/80 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Colleges</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-purple-800/40 bg-purple-950/60 px-3 py-1 text-xs font-medium text-purple-300">
                    <MapPin className="h-3.5 w-3.5 text-purple-400" />
                    <span>385 Colleges</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/60 px-3 py-1 text-xs font-semibold text-purple-300 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                    1,925 Verified PGs
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View 1: Landing Page with College Search */}
        {activeView === 'landing' && (
          <main className="flex flex-1 flex-col items-center justify-center px-4 py-14 text-center sm:px-6 sm:py-24">
            <div className="mx-auto w-full max-w-3xl">
              {/* Sparkles pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
                <span>385 Bangalore Colleges • 1,925 Verified PGs</span>
              </div>

              {/* Headline */}
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
                Find your college in <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">
                  Bangalore
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm font-normal text-zinc-400 sm:text-base leading-relaxed">
                Search and click any college name to see 5 verified PGs near campus with zero photo clutter and instant Google Search redirection swipes.
              </p>

              {/* College Search Bar */}
              <div className="mx-auto mt-8 max-w-2xl">
                <CollegeSearchBar
                  colleges={colleges}
                  selectedCollege={selectedCollege}
                  onSelect={handleSelectCollege}
                />

                {/* Status note */}
                <div className="mt-3.5 flex items-center justify-center gap-2 text-xs text-purple-300/80">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span>
                    <strong>{colleges.length} Bangalore colleges</strong> indexed with 5 curated PGs each (
                    <strong>{TOTAL_PGS_COUNT} total PGs</strong>)
                  </span>
                </div>
              </div>

              {/* Popular Colleges Chips */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400/90">
                  Popular Student Campuses:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  {colleges.slice(0, 8).map((college) => (
                    <button
                      key={college.id}
                      onClick={() => handleSelectCollege(college)}
                      className="group flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-300 backdrop-blur-md transition-all hover:border-purple-400/70 hover:bg-purple-950/80 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    >
                      <MapPin className="h-3 w-3 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span>{college.name.split('(')[0].trim()}</span>
                      <span className="rounded-full bg-purple-900/60 px-1.5 py-0.2 text-[10px] text-purple-300">
                        5 PGs
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
                <div className="rounded-2xl border border-purple-500/20 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 text-purple-300 border border-purple-500/30 mb-3">
                    <Building className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">385 Campuses Covered</h4>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Engineering, Medical, Commerce & University campuses across all Bangalore zones.
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 text-purple-300 border border-purple-500/30 mb-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">1,925 Verified PGs</h4>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Minimum 5 high-quality PGs per college with food, WiFi, CCTV & zero brokerage.
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 text-purple-300 border border-purple-500/30 mb-3">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Redirection Swipe</h4>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    No misleading photos. Swipe any card to directly open that PG's Google Maps and reviews.
                  </p>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* View 2: College PG Listing Page */}
        {activeView === 'college-pgs' && selectedCollege && (
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {/* Navigation & Breadcrumbs */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <button
                  onClick={handleBackToLanding}
                  className="group inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-zinc-950/80 px-4 py-2 text-xs font-semibold text-purple-300 backdrop-blur-xl transition-all hover:border-purple-400 hover:bg-purple-950/70 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back to College Search</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Bangalore</span>
                  <span>/</span>
                  <span className="text-purple-300">{selectedCollege.area || 'Campus'}</span>
                  <span>/</span>
                  <span className="text-white font-medium truncate max-w-xs">
                    {selectedCollege.name}
                  </span>
                </div>
              </div>

              {/* College Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/35 bg-zinc-950/85 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur-2xl sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-600/15 blur-3xl" />

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-gradient-to-tr from-purple-900/90 to-purple-600/50 text-purple-200 shadow-lg shadow-purple-950/50">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-950/70 px-3 py-0.5 text-xs font-semibold text-purple-300">
                          <MapPin className="h-3 w-3" />
                          {selectedCollege.area || 'Bangalore'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          5 Verified PGs Near Campus
                        </span>
                      </div>

                      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl tracking-tight">
                        {selectedCollege.name}
                      </h2>

                      {selectedCollege.lat && selectedCollege.lng && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                          <Compass className="h-3.5 w-3.5 text-purple-400" />
                          GPS Coordinates: {selectedCollege.lat.toFixed(4)},{' '}
                          {selectedCollege.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* College Quick Switcher for Mobile */}
                  <div className="block md:hidden">
                    <CollegeSearchBar
                      colleges={colleges}
                      selectedCollege={selectedCollege}
                      onSelect={handleSelectCollege}
                      placeholder="Switch college..."
                      compact
                    />
                  </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-purple-950/60 pt-5 sm:grid-cols-4">
                  <div className="rounded-xl border border-purple-500/15 bg-zinc-900/40 p-3">
                    <span className="text-[11px] text-zinc-400">Available PGs</span>
                    <p className="text-lg font-bold text-white">5 Verified Stays</p>
                  </div>
                  <div className="rounded-xl border border-purple-500/15 bg-zinc-900/40 p-3">
                    <span className="text-[11px] text-zinc-400">Distance to Gate</span>
                    <p className="text-lg font-bold text-white">0.2 - 1.2 km</p>
                  </div>
                  <div className="rounded-xl border border-purple-500/15 bg-zinc-900/40 p-3">
                    <span className="text-[11px] text-zinc-400">Rent Range</span>
                    <p className="text-lg font-bold text-white">₹6,000 - ₹16,500</p>
                  </div>
                  <div className="rounded-xl border border-purple-500/15 bg-zinc-900/40 p-3">
                    <span className="text-[11px] text-zinc-400">Food Included</span>
                    <p className="text-lg font-bold text-emerald-400">100% 3 Meals</p>
                  </div>
                </div>
              </div>

              {/* Filters and Sorting Controls */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-purple-500/25 bg-zinc-950/70 p-4 backdrop-blur-xl">
                {/* Gender Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mr-1">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-purple-400" />
                    Filter:
                  </span>
                  {(['All', 'Ladies', 'Gents', 'Coliving'] as const).map((gender) => {
                    const count =
                      gender === 'All'
                        ? currentPgs.length
                        : currentPgs.filter((pg) => pg.gender === gender).length;
                    const isActive = genderFilter === gender;
                    return (
                      <button
                        key={gender}
                        onClick={() => setGenderFilter(gender)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : 'border border-purple-500/20 bg-zinc-900/70 text-zinc-300 hover:border-purple-400/50 hover:text-white'
                        }`}
                      >
                        {gender} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5 text-purple-400" />
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-xl border border-purple-500/30 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white outline-none backdrop-blur-xl focus:border-purple-400"
                  >
                    <option value="distance" className="bg-zinc-900">
                      Nearest First (Walking Distance)
                    </option>
                    <option value="rent-asc" className="bg-zinc-900">
                      Rent: Low to High
                    </option>
                    <option value="rent-desc" className="bg-zinc-900">
                      Rent: High to Low
                    </option>
                    <option value="rating" className="bg-zinc-900">
                      Highest Rated
                    </option>
                  </select>
                </div>
              </div>

              {/* PG Cards Grid: NO PHOTOS, REDIRECTION SWIPE */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>PG Accommodations near {selectedCollege.name.split('(')[0].trim()}</span>
                    <span className="rounded-full bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 text-xs text-purple-300">
                      {displayedPgs.length} Available
                    </span>
                  </h3>
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    No misleading photos • Direct Google Search Redirection
                  </span>
                </div>

                {displayedPgs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayedPgs.map((pg) => (
                      <PgCard key={pg.id} pg={pg} college={selectedCollege} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-purple-500/30 bg-zinc-950/80 p-12 text-center backdrop-blur-xl">
                    <p className="text-base font-semibold text-zinc-300">
                      No PGs match the "{genderFilter}" filter.
                    </p>
                    <button
                      onClick={() => setGenderFilter('All')}
                      className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-purple-500"
                    >
                      Clear Filters (Show All 5 PGs)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Global Footer */}
        <footer className="mt-auto border-t border-purple-950/40 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-900/60 text-purple-300">
                <Home className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-zinc-300">SKOLAR Bengaluru</span>
              <span className="text-zinc-600">•</span>
              <span className="text-purple-300/80">385 Colleges • 1,925 Verified PGs</span>
            </div>
            <p className="text-zinc-500">
              Bangalore Student Living Directory with direct Google verification.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
