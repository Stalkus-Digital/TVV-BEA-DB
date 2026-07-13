import { Star } from "lucide-react";

interface RatingComponentProps {
  rating: number;
  onChange: (rating: number) => void;
}

export function RatingComponent({ rating, onChange }: RatingComponentProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-1 transition-colors ${
            star <= rating ? "text-amber-400" : "text-slate-200 hover:text-slate-300"
          }`}
        >
          <Star className="h-6 w-6" fill={star <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
