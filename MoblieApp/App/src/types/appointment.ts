export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending';

export interface BookingDetails {
  serviceId?: string;
  serviceName?: string;
  doctorName?: string;
  specialty?: string;
  date?: string;
  time?: string;
  price?: number;
  location?: string;
  paymentMethod?: string;
}

export interface BookingItem {
  id: string;
  doctorName: string;
  specialty: string;
  avatarUrl?: string;
  date: string;
  time: string;
  status: BookingStatus;
  location?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  duration: string;
  price: string;
  description?: string;
  iconName?: string;
}
