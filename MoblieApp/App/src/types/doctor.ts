export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount?: number;
  experienceYears?: number;
  price?: number;
  avatarUrl?: string;
  bio?: string;
  isSaved?: boolean;
}
