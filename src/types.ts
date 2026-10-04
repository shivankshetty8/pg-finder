export interface College {
  id: string;
  name: string;
  area: string | null;
  lat: number | null;
  lng: number | null;
}

export interface PgListing {
  id: string;
  name: string;
  gender: 'Ladies' | 'Gents' | 'Coliving';
  rent: number;
  rating: number;
  distance_km: number;
  college_id: string | null;
  image_url: string | null;
  amenities: string[];
}
