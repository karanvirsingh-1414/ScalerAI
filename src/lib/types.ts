export type CustomQuestion = {
  label: string;
  required: boolean;
};

export type EventType = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  customQuestions: unknown;
};

export type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  timezone: string;
};

export type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "CANCELLED";
  answers?: unknown;
  noShowRiskScore?: number;
  noShowRiskReasons?: string[];
  eventType: EventType;
};

export type BookingAnalytics = {
  totalBookings: number;
  scheduledBookings: number;
  cancelledBookings: number;
  upcomingBookings: number;
  cancellationRate: number;
  conversionRate: number;
  busiestDay: { day: number; count: number };
  byEventType: Array<{ title: string; count: number }>;
  funnel: {
    totalRequests: number;
    scheduled: number;
    upcoming: number;
  };
};
