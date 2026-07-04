import { cancelBooking, fetchBookingDetail, fetchMyBookings } from "@/lib/api/bookings";
import { myBookingsService } from "@/lib/services/myBookings.service";

export const bookingsFeatureService = {
  list: () => myBookingsService.list(),
  get(kind: Parameters<typeof myBookingsService.get>[0], id: string) {
    return myBookingsService.get(kind, id);
  },
  api: {
    fetchList: fetchMyBookings,
    fetchDetail: fetchBookingDetail,
    cancel: cancelBooking,
  },
};
