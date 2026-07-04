import { bookingsFeatureService } from "@/features/bookings";
import { quotesFeatureService } from "@/features/quotes";
import { addToWishlist, changePassword, fetchWishlist, removeFromWishlist, updateProfile } from "@/lib/api/users";

export const dashboardFeatureService = {
  bookings: bookingsFeatureService,
  quotes: quotesFeatureService,
  wishlist: {
    list: fetchWishlist,
    add: addToWishlist,
    remove: removeFromWishlist,
  },
  profile: {
    update: updateProfile,
    changePassword,
  },
};
