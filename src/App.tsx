import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Star,
  IndianRupee,
  Navigation,
  Wifi,
  UtensilsCrossed,
  WashingMachine,
  Dumbbell,
  Snowflake,
  ShieldCheck,
  Car,
  Droplets,
  Sparkles,
  Home,
  Users,
  Heart,
  X,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { College, PgListing } from '@/types';

type GenderFilter = 'All' | 'Ladies' | 'Gents' | 'Coliving';
type SortBy = 'distance' | 'rent-low' | 'rent-high' | 'rating';

const amenityIconMap: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  Food: UtensilsCrossed,
  Laundry: WashingMachine,
  Gym: Dumbbell,
  AC: Snowflake,
  '24/7 Security': ShieldCheck,
  Security: ShieldCheck,
  Parking: Car,
  'Hot Water': Droplets,
  Housekeeping: Sparkles,
};

function getAmenityIcon(amenity: string) {
  return amenityIconMap[amenity] ?? Home;
}

const genderStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Ladies: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'Ladies',
  },
  Gents: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    label: 'Gents',
  },
  Coliving: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Coliving',
  },
};

function formatRent(rent: number): string {
  return rent.toLocaleString('en-IN');
}

function PgCard({ pg }: { pg: PgListing }) {
  const style = genderStyles[pg.gender] ?? genderStyles.Coliving;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={pg.image_url ?? ''}
          alt={pg.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${style.bg} ${style.text} ${style.border} backdrop-blur-sm`}>
            {pg.gender === 'Ladies' ? <Heart className="h-3 w-3" /> : pg.gender === 'Gents' ? <Users className="h-3 w-3" /> : <Home className="h-3 w-3" />}
            {style.label}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow-sm backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          {Number(pg.rating).toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-slate-900">{pg.name}</h3>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
          <Navigation className="h-3.5 w-3.5 text-teal-600" />
          <span>{Number(pg.distance_km).toFixed(1)} km from campus</span>
        </div>

        {/* Amenities */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pg.amenities.slice(0, 5).map((amenity) => {
            const Icon = getAmenityIcon(amenity);
            return (
              <span key={amenity} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                <Icon className="h-3 w-3 text-slate-400" />
                {amenity}
              </span>
            );
          })}
          {pg.amenities.length > 5 && (
            <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
              +{pg.amenities.length - 5} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-slate-700" />
              <span className="text-xl font-extrabold text-slate-900">{formatRent(pg.rent)}</span>
            </div>
            <p className="text-[11px] text-slate-400">per month</p>
          </div>
          <button className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow-md active:scale-95">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function CollegeSearchBar({
  colleges,
  selectedCollege,
  onSelect,
}: {
  colleges: College[];
  selectedCollege: College | null;
  onSelect: (college: College) => void;
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
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
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
          placeholder="Search your college in Bangalore..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-800 shadow-lg shadow-slate-200/50 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        />
        {selectedCollege && !query && (
          <button
            onClick={() => onSelect(null as unknown as College)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-300/40">
          {filtered.map((college, idx) => (
            <button
              key={college.id}
              onClick={() => handleSelect(college)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                idx === highlightIndex ? 'bg-teal-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
                <MapPin className="h-4 w-4 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{college.name}</p>
                <p className="truncate text-xs text-slate-400">{college.area}</p>
              </div>
              {selectedCollege?.id === college.id && (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-teal-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && filtered.length === 0 && query && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white py-6 text-center shadow-xl">
          <p className="text-sm text-slate-500">No colleges found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
        active
          ? 'border-teal-600 bg-teal-600 text-white shadow-sm shadow-teal-600/20'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function SortDropdown({
  sortBy,
  onChange,
}: {
  sortBy: SortBy;
  onChange: (s: SortBy) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const labels: Record<SortBy, string> = {
    distance: 'Nearest',
    'rent-low': 'Rent: Low to High',
    'rent-high': 'Rent: High to Low',
    rating: 'Top Rated',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
      >
        <TrendingUp className="h-4 w-4 text-slate-400" />
        {labels[sortBy]}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {(Object.keys(labels) as SortBy[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                sortBy === key ? 'bg-teal-50 font-semibold text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {labels[key]}
              {sortBy === key && <CheckCircle2 className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [pgs, setPgs] = useState<PgListing[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [sortBy, setSortBy] = useState<SortBy>('distance');
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingPgs, setLoadingPgs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all colleges once on mount
  useEffect(() => {
    async function loadColleges() {
      try {
        setLoadingColleges(true);
        const { data, error: err } = await supabase
          .from('colleges')
          .select('*')
          .order('name');
        if (err) throw err;
        setColleges((data as College[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load colleges');
      } finally {
        setLoadingColleges(false);
      }
    }
    loadColleges();
  }, []);

  // Fetch PGs from Supabase whenever the selected college changes
  useEffect(() => {
    async function loadPgs() {
      if (!selectedCollege) {
        setPgs([]);
        return;
      }
      try {
        setLoadingPgs(true);
        setError(null);
        const { data, error: err } = await supabase
          .from('pgs')
          .select('*')
          .eq('college_id', selectedCollege.id);
        if (err) throw err;
        setPgs((data as PgListing[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PGs');
      } finally {
        setLoadingPgs(false);
      }
    }
    loadPgs();
  }, [selectedCollege]);

  // Reset gender filter when college changes
  useEffect(() => {
    setGenderFilter('All');
  }, [selectedCollege]);

  const filteredPgs = useMemo(() => {
    let result = [...pgs];

    if (genderFilter !== 'All') {
      result = result.filter((pg) => pg.gender === genderFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rent-low':
          return a.rent - b.rent;
        case 'rent-high':
          return b.rent - a.rent;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
        default:
          return a.distance_km - b.distance_km;
      }
    });

    return result;
  }, [pgs, genderFilter, sortBy]);

  const genderCounts = useMemo(() => {
    return {
      All: pgs.length,
      Ladies: pgs.filter((pg) => pg.gender === 'Ladies').length,
      Gents: pgs.filter((pg) => pg.gender === 'Gents').length,
      Coliving: pgs.filter((pg) => pg.gender === 'Coliving').length,
    };
  }, [pgs]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-sm shadow-teal-600/20">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">PG Finder</h1>
              <p className="hidden text-[11px] text-slate-400 sm:block">Bangalore Student Housing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span className="hidden sm:inline">Bengaluru</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Find your perfect stay near campus
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Find PGs near your<br className="hidden sm:block" /> college in Bangalore
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-teal-50 sm:text-base">
            {loadingColleges
              ? 'Loading colleges...'
              : `Search from ${colleges.length} colleges and discover verified PGs with rent, ratings, amenities, and distance — all in one place.`}
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <CollegeSearchBar
              colleges={colleges}
              selectedCollege={selectedCollege}
              onSelect={setSelectedCollege}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Selected College Banner */}
        {selectedCollege && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedCollege.name}</p>
                <p className="text-xs text-slate-500">{selectedCollege.area}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCollege(null)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FilterPill active={genderFilter === 'All'} onClick={() => setGenderFilter('All')}>
              All <span className="text-[10px] opacity-70">({genderCounts.All})</span>
            </FilterPill>
            <FilterPill active={genderFilter === 'Ladies'} onClick={() => setGenderFilter('Ladies')}>
              <Heart className="h-3.5 w-3.5" />
              Ladies <span className="text-[10px] opacity-70">({genderCounts.Ladies})</span>
            </FilterPill>
            <FilterPill active={genderFilter === 'Gents'} onClick={() => setGenderFilter('Gents')}>
              <Users className="h-3.5 w-3.5" />
              Gents <span className="text-[10px] opacity-70">({genderCounts.Gents})</span>
            </FilterPill>
            <FilterPill active={genderFilter === 'Coliving'} onClick={() => setGenderFilter('Coliving')}>
              <Home className="h-3.5 w-3.5" />
              Coliving <span className="text-[10px] opacity-70">({genderCounts.Coliving})</span>
            </FilterPill>
          </div>
          <SortDropdown sortBy={sortBy} onChange={setSortBy} />
        </div>

        {/* Results */}
        {!selectedCollege ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
              <Search className="h-8 w-8 text-teal-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">Search for your college</p>
            <p className="mt-1 text-sm text-slate-400">
              Pick a college from the search bar above to see nearby PGs.
            </p>
          </div>
        ) : loadingPgs ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
            <p className="mt-4 text-sm text-slate-500">Loading PGs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 py-16">
            <p className="text-sm font-semibold text-rose-700">Something went wrong</p>
            <p className="mt-1 text-xs text-rose-500">{error}</p>
          </div>
        ) : filteredPgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No PGs found</p>
            <p className="mt-1 text-sm text-slate-400">
              {selectedCollege
                ? `No PGs match your filters near ${selectedCollege.name}.`
                : 'Select a college or adjust your filters to see results.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Showing <span className="font-bold text-slate-700">{filteredPgs.length}</span>{' '}
              {filteredPgs.length === 1 ? 'PG' : 'PGs'}
              {selectedCollege && (
                <> near <span className="font-semibold text-slate-700">{selectedCollege.name}</span></>
              )}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPgs.map((pg) => (
                <PgCard key={pg.id} pg={pg} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800">PG Finder Bangalore</span>
            </div>
            <p className="text-xs text-slate-400">
              Helping students find their home away from home.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
