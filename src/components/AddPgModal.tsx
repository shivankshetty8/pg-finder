import { useState } from 'react';
import {
  X,
  Upload,
  IndianRupee,
  MapPin,
  Star,
  Users,
  Heart,
  Home,
  Wifi,
  UtensilsCrossed,
  WashingMachine,
  Dumbbell,
  Snowflake,
  ShieldCheck,
  Car,
  Droplets,
  Sparkles,
  Zap,
  Check,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PgListing } from '@/types';

export const BANGALORE_AREAS = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  { name: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
  { name: 'Mathikere (near Ramaiah)', lat: 13.0315, lng: 77.5645 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'Jayanagar', lat: 12.9308, lng: 77.5838 },
  { name: 'Marathahalli', lat: 12.9591, lng: 77.6974 },
  { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
  { name: 'Rajajinagar', lat: 12.9982, lng: 77.5530 },
  { name: 'Malleshwaram', lat: 13.0031, lng: 77.5643 },
  { name: 'Bannerghatta Road', lat: 12.8953, lng: 77.5986 },
  { name: 'JP Nagar', lat: 12.9063, lng: 77.5857 },
  { name: 'Bellandur', lat: 12.9260, lng: 77.6762 },
];

const PHOTO_PRESETS = [
  {
    title: 'Modern Single Room',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Cozy Double Sharing',
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Executive Studio',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Bright Student Room',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Coliving Living Space',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Spacious Deluxe Room',
    url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80',
  },
];

const AMENITY_OPTIONS = [
  { name: 'WiFi', icon: Wifi },
  { name: 'Food', icon: UtensilsCrossed },
  { name: 'AC', icon: Snowflake },
  { name: 'Laundry', icon: WashingMachine },
  { name: '24/7 Security', icon: ShieldCheck },
  { name: 'Gym', icon: Dumbbell },
  { name: 'Parking', icon: Car },
  { name: 'Hot Water', icon: Droplets },
  { name: 'Housekeeping', icon: Sparkles },
  { name: 'Power Backup', icon: Zap },
];

interface AddPgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPgAdded: (newPg: PgListing) => void;
}

export function AddPgModal({ isOpen, onClose, onPgAdded }: AddPgModalProps) {
  const [name, setName] = useState('');
  const [selectedArea, setSelectedArea] = useState(BANGALORE_AREAS[0].name);
  const [customArea, setCustomArea] = useState('');
  const [lat, setLat] = useState<number>(BANGALORE_AREAS[0].lat);
  const [lng, setLng] = useState<number>(BANGALORE_AREAS[0].lng);
  const [gender, setGender] = useState<'Ladies' | 'Gents' | 'Coliving'>('Coliving');
  const [rent, setRent] = useState('8500');
  const [rating, setRating] = useState('4.5');
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [amenities, setAmenities] = useState<string[]>([
    'WiFi',
    'Food',
    'Hot Water',
    '24/7 Security',
    'Housekeeping',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleAreaChange(areaName: string) {
    setSelectedArea(areaName);
    if (areaName !== 'custom') {
      const match = BANGALORE_AREAS.find((a) => a.name === areaName);
      if (match) {
        setLat(match.lat);
        setLng(match.lng);
      }
    }
  }

  function toggleAmenity(item: string) {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const effectiveArea =
      selectedArea === 'custom' ? customArea.trim() || 'Bangalore' : selectedArea;
    const finalRent = parseInt(rent, 10);
    const finalRating = parseFloat(rating) || 4.5;

    if (!name.trim()) {
      setErrorMsg('Please enter a name for the PG.');
      return;
    }
    if (isNaN(finalRent) || finalRent <= 0) {
      setErrorMsg('Please enter a valid monthly rent amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        gender,
        rent: finalRent,
        rating: finalRating,
        lat,
        lng,
        area: effectiveArea,
        image_url: imageUrl.trim() || PHOTO_PRESETS[0].url,
        amenities,
      };

      // Try inserting into Supabase
      const { data, error } = await supabase
        .from('pg_listings')
        .insert([payload])
        .select();

      let createdId = `pg-${Date.now()}`;
      if (error) {
        console.warn('Supabase insert warning:', error);
        // If error is about missing table/column or RLS, warn but still construct listing locally so user isn't blocked
        if (error.message.includes('column') || error.message.includes('relation')) {
          setErrorMsg(
            `Database warning: ${error.message}. Please make sure you ran the updated SQL script in Supabase!`
          );
        }
      } else if (data && data[0]?.id) {
        createdId = String(data[0].id);
      }

      const newListing: PgListing = {
        id: createdId,
        name: name.trim(),
        gender,
        rent: finalRent,
        rating: finalRating,
        distance_km: 1.2,
        college_id: null,
        image_url: imageUrl.trim() || PHOTO_PRESETS[0].url,
        amenities,
        area: effectiveArea,
      };

      onPgAdded(newListing);
      onClose();
    } catch (err) {
      console.error('Failed to create PG:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to publish PG. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 shadow-md shadow-teal-600/30">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              List a PG in Bangalore
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              Add your property with rent, pictures, and amenities.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* PG Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              PG Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stanza Living Boston House or Sri Lakshmi Ladies PG"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          {/* Area & Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Bangalore Locality *
              </label>
              <select
                value={selectedArea}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              >
                {BANGALORE_AREAS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
                <option value="custom">Other / Custom Locality</option>
              </select>
            </div>

            {selectedArea === 'custom' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Custom Area Name
                </label>
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  placeholder="e.g. Hebbal, Sarjapur, etc."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Coordinates (Auto-filled)
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <span>
                    Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Gender & Rent */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Gender Category *
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: 'Coliving', label: 'Coliving', icon: Home, color: 'emerald' },
                  { id: 'Ladies', label: 'Ladies', icon: Heart, color: 'rose' },
                  { id: 'Gents', label: 'Gents', icon: Users, color: 'sky' },
                ].map((item) => {
                  const isSelected = gender === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setGender(item.id as typeof gender)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Monthly Rent (₹) *
              </label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  min="2000"
                  max="100000"
                  step="500"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
              <div className="mt-1.5 flex gap-1.5">
                {['6500', '8500', '12000', '15000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRent(amt)}
                    className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200"
                  >
                    ₹{parseInt(amt, 10).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Expected Rating
              </label>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {rating}
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="mt-2 w-full accent-teal-600"
            />
          </div>

          {/* Picture / Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Picture / Image URL *
            </label>
            <div className="mt-1.5 flex gap-3">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste an image URL (Unsplash, Supabase Storage, etc.)"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
              {/* Preview Thumbnail */}
              <div className="h-10 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback if broken image URL
                    (e.target as HTMLImageElement).src = PHOTO_PRESETS[0].url;
                  }}
                />
              </div>
            </div>

            {/* Quick Photo Presets */}
            <div className="mt-2.5">
              <p className="text-[11px] font-medium text-slate-400">
                Or pick a quick room photo preset:
              </p>
              <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PHOTO_PRESETS.map((preset) => {
                  const isCurrent = imageUrl === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.title}
                      onClick={() => setImageUrl(preset.url)}
                      className={`group relative h-14 overflow-hidden rounded-xl border-2 transition-all ${
                        isCurrent
                          ? 'border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={preset.title}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="h-full w-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 flex items-center justify-center bg-teal-900/40">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Amenities Included ({amenities.length} selected)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((item) => {
                const selected = amenities.includes(item.name);
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => toggleAmenity(item.name)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      selected
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        selected ? 'text-teal-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.name}</span>
                    {selected && <Check className="ml-0.5 h-3 w-3 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Publish PG Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
