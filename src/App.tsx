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
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { College } from '@/types';
import { DEFAULT_COLLEGES } from '@/lib/mockData';
import MicroSlats from './components/MicroSlats';

function CollegeSearchBar({
  colleges,
  selectedCollege,
  onSelect,
}: {
  colleges: College[];
  selectedCollege: College | null;
  onSelect: (college: College | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return colleges;
    const q = query.toLowerCase();
    return colleges.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.area?.toLowerCase().includes(q) ?? false)
    );
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
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400/80 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search among 380+ Bangalore colleges..."
          className="w-full rounded-2xl border border-purple-500/30 bg-zinc-950/80 py-4 pl-12 pr-11 text-sm font-medium text-white shadow-2xl shadow-purple-950/40 outline-none backdrop-blur-xl transition-all duration-200 placeholder:text-zinc-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20"
        />
        {selectedCollege && !query && (
          <button
            onClick={() => onSelect(null)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-purple-500/30 bg-zinc-950/95 py-2 shadow-2xl shadow-black/80 backdrop-blur-2xl scrollbar-thin">
          <div className="flex items-center justify-between border-b border-purple-950/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-purple-300/80">
            <span>{filtered.length} {filtered.length === 1 ? 'College' : 'Colleges'} Found</span>
            <span className="text-[10px] normal-case text-zinc-500">Bangalore Hubs</span>
          </div>
          {filtered.slice(0, 50).map((college, idx) => (
            <button
              key={college.id}
              onClick={() => handleSelect(college)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                idx === highlightIndex
                  ? 'bg-purple-900/40 text-white'
                  : 'text-zinc-200 hover:bg-purple-950/50 hover:text-white'
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-purple-800/40 bg-purple-950/70 text-purple-300">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{college.name}</p>
                <p className="truncate text-xs text-purple-300/70">{college.area}</p>
              </div>
              {selectedCollege?.id === college.id && (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-purple-400" />
              )}
            </button>
          ))}
          {filtered.length > 50 && (
            <div className="border-t border-purple-950/60 bg-zinc-900/50 px-4 py-2.5 text-center text-xs font-medium text-zinc-400">
              Showing top 50 of {filtered.length} colleges — type to narrow down results
            </div>
          )}
        </div>
      )}

      {isOpen && filtered.length === 0 && query && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-purple-500/30 bg-zinc-950/95 py-6 text-center shadow-2xl backdrop-blur-2xl">
          <p className="text-sm text-zinc-400">No colleges found matching "{query}"</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'unconfigured' | 'error'>('unconfigured');

  // Fetch all colleges on mount
  useEffect(() => {
    async function loadColleges() {
      try {
        setLoadingColleges(true);
        if (isSupabaseConfigured) {
          const { data, error: err } = await supabase
            .from('colleges')
            .select('*')
            .order('name')
            .limit(1000);
          if (!err && data && data.length > 0) {
            setColleges(data as College[]);
            setDbStatus('connected');
            return;
          }
        }
        setColleges(DEFAULT_COLLEGES);
      } catch (err) {
        console.warn('Supabase college fetch fallback:', err);
        setColleges(DEFAULT_COLLEGES);
      } finally {
        setLoadingColleges(false);
      }
    }
    loadColleges();
  }, []);

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
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 pointer-events-none z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-purple-900/30 bg-black/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
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
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-purple-800/40 bg-purple-950/60 px-3 py-1 text-xs font-medium text-purple-300">
                <MapPin className="h-3.5 w-3.5 text-purple-400" />
                <span>Bengaluru</span>
              </div>

              {dbStatus === 'connected' ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Live ({colleges.length} colleges)
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/60 px-3 py-1 text-xs font-semibold text-purple-300 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  {colleges.length} Colleges Available
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mx-auto w-full max-w-3xl">
            {/* Sparkles pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
              <span>Bangalore Campus & Student Living Hub</span>
            </div>

            {/* Headline */}
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
              Find your college in <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">
                Bangalore
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm font-normal text-zinc-400 sm:text-base leading-relaxed">
              {loadingColleges
                ? 'Loading colleges across Bangalore...'
                : `Instant directory across ${colleges.length} colleges with verified campuses, neighborhood hubs, and housing proximity.`}
            </p>

            {/* College Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <CollegeSearchBar
                colleges={colleges}
                selectedCollege={selectedCollege}
                onSelect={setSelectedCollege}
              />

              {/* Status note */}
              <div className="mt-3.5 flex items-center justify-center gap-2 text-xs text-purple-300/80">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>
                  <strong>{colleges.length} Bangalore colleges</strong> available across Engineering, Medical, Arts & Commerce
                </span>
              </div>
            </div>

            {/* Selected College Detail Card */}
            {selectedCollege && (
              <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-3xl border border-purple-500/40 bg-zinc-950/80 p-6 text-left shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-2xl transition-all">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-gradient-to-tr from-purple-900/80 to-purple-700/50 text-purple-300 shadow-md">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
                        <MapPin className="h-3 w-3" />
                        {selectedCollege.area || 'Bangalore'}
                      </span>
                      <h3 className="mt-1.5 text-lg font-bold text-white sm:text-xl">
                        {selectedCollege.name}
                      </h3>
                      {selectedCollege.lat && selectedCollege.lng && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                          <Compass className="h-3 w-3 text-purple-400" />
                          GPS: {selectedCollege.lat.toFixed(4)}, {selectedCollege.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCollege(null)}
                    className="inline-flex items-center gap-1.5 self-start rounded-xl border border-purple-500/30 bg-purple-950/40 px-3.5 py-2 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-900/60 hover:text-white sm:self-center"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Popular Colleges Chips */}
            {!selectedCollege && colleges.length > 0 && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="font-semibold text-purple-400">Popular:</span>
                {colleges
                  .filter((c) => c.name && c.name.trim().length > 3)
                  .slice(0, 6)
                  .map((college) => (
                    <button
                      key={college.id}
                      onClick={() => setSelectedCollege(college)}
                      className="rounded-full border border-purple-500/20 bg-zinc-900/70 px-3.5 py-1.5 text-xs text-zinc-300 backdrop-blur-md transition-all hover:border-purple-400/60 hover:bg-purple-950/70 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    >
                      {college.name.split('(')[0].trim()}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-purple-950/40 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-900/60 text-purple-300">
                <Home className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-zinc-300">SKOLAR Bengaluru</span>
            </div>
            <p className="text-zinc-500">
              Connecting students across 380+ Bangalore colleges.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
