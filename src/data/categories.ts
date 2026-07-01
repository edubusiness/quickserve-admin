export interface Category {
  id: string;
  name: string;
  services: number;
  providers: number;
  bookings: number;
  status: "active" | "inactive";
}
