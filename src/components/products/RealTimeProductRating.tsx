import { StarRating } from "./StarRating";
import { useRealTimeRating } from "@/hooks/useRealTimeRating";

interface Props {
  productId: string;
  handle?: string;
  initialRating?: number;
  initialCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const RealTimeProductRating = ({ 
  productId, 
  handle, 
  initialRating = 0, 
  initialCount = 0,
  className,
  size = "sm"
}: Props) => {
  const { rating, count } = useRealTimeRating(productId, handle, initialRating, initialCount);

  if (count === 0) return null;

  return (
    <div className={className} title={`${count} reviews`}>
      <StarRating rating={rating} count={count} size={size} />
    </div>
  );
};