import {
  Home,
  Zap,
  Droplets,
  Car,
  Scissors,
  Wind,
  Bug,
  Paintbrush,
  Wrench,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  price: number;
  bookings: number;
  rating: number;
  providers: number;
  active: boolean;
  trend: number;
}

export const services: Service[] = [
  { id: "SVC-01", name: "Home Cleaning", category: "Cleaning", icon: Home, price: 499, bookings: 1248, rating: 4.8, providers: 142, active: true, trend: 24.5 },
  { id: "SVC-02", name: "Electrician", category: "Repairs", icon: Zap, price: 299, bookings: 1128, rating: 4.7, providers: 98, active: true, trend: 18.3 },
  { id: "SVC-03", name: "Plumbing", category: "Repairs", icon: Droplets, price: 349, bookings: 985, rating: 4.6, providers: 76, active: true, trend: 15.6 },
  { id: "SVC-04", name: "Car Service", category: "Automotive", icon: Car, price: 1299, bookings: 873, rating: 4.5, providers: 54, active: true, trend: 12.7 },
  { id: "SVC-05", name: "Salon at Home", category: "Beauty", icon: Scissors, price: 799, bookings: 765, rating: 4.9, providers: 112, active: true, trend: 11.2 },
  { id: "SVC-06", name: "AC Service", category: "Appliances", icon: Wind, price: 599, bookings: 642, rating: 4.6, providers: 67, active: true, trend: 9.4 },
  { id: "SVC-07", name: "Pest Control", category: "Cleaning", icon: Bug, price: 899, bookings: 421, rating: 4.4, providers: 38, active: true, trend: 7.1 },
  { id: "SVC-08", name: "Wall Painting", category: "Home", icon: Paintbrush, price: 2499, bookings: 312, rating: 4.7, providers: 29, active: false, trend: -2.3 },
  { id: "SVC-09", name: "Appliance Repair", category: "Appliances", icon: Wrench, price: 449, bookings: 534, rating: 4.5, providers: 61, active: true, trend: 6.8 },
  { id: "SVC-10", name: "Deep Cleaning", category: "Cleaning", icon: Sparkles, price: 1499, bookings: 289, rating: 4.8, providers: 44, active: false, trend: 3.2 },
];

export const serviceCategories = [
  "All",
  ...Array.from(new Set(services.map((s) => s.category))),
];
