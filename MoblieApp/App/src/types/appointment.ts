export type { BookingStatus, PlaceType, BookingItem } from '../constants/bookingsData';

export interface ServiceItem {
  id: string;
  title: string;
  duration: string;
  price: string;
  description?: string;
  iconName?: string;
}
