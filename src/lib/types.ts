export type ReservationStatus = "confirmed" | "cancelled" | "completed";

export type Unit = {
  id: string;
  org_id: string;
  nickname: string;
  city: string;
  bedrooms: number;
  base_nightly_rate: number;
};

export type Reservation = {
  id: string;
  org_id: string;
  unit_id: string;
  pms_reservation_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_revenue: number;
  status: ReservationStatus;
  channel: string;
  created_at: string;
  units?: Pick<Unit, "nickname" | "city"> | null;
};

export type UserProfile = {
  id: string;
  org_id: string;
  email: string;
  created_at: string;
};

export type DateRange = {
  start?: string;
  end?: string;
};

export type DashboardMetrics = {
  revenue: number;
  reservations: number;
  roomsSold: number;
  roomsAvailable: number;
  occupancyRate: number;
  adr: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
};
