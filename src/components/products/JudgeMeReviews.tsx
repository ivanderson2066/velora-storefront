import { Star, CheckCircle2, Image as ImageIcon, User } from "lucide-react";
import { useEffect, useState } from "react";
import { parseReviewsCSV, Review } from "@/lib/csvParser";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface JudgeMeReviewsProps {
  productId: string;
  productTitle?: string;
  productHandle: string;
}

export const JudgeMeReviews = ({ productTitle = "Avaliações", productHandle }: JudgeMeReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode] = useState<"list">("list");
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [imagesText, setImagesText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/reviews.csv');
        
        if (response.ok) {
          const csvText = await response.text();
          const allReviews = parseReviewsCSV(csvText);
          
          const productReviews = allReviews.filter(r => {
            if (!r.productHandle || !productHandle) return false;
            const csvHandle = r.productHandle.toLowerCase();
            const currentHandle = productHandle.toLowerCase();
            return csvHandle === currentHandle || currentHandle.includes(csvHandle) || csvHandle.includes(currentHandle);
          });

          let merged = [...productReviews];

          if (supabase) {
            const { data, error } = await supabase
              .from('reviews')
              .select('*')
              .eq('product_handle', productHandle);

            if (!error && Array.isArray(data)) {
              const supaReviews: Review[] = data.map((
                row: {
                  id?: string | number;
                  title?: string;
                  body?: string;
                  rating?: number | string;
                  author?: string;
                  date?: string;
                  product_handle?: string;
                  images?: string[];
                  picture_urls?: string;
                },
                idx: number
              ) => ({
                id: row.id?.toString?.() ?? `sb-review-${idx}`,
                title: row.title ?? "",
                body: row.body ?? "",
                rating: Number(row.rating) || 0,
                author: row.author ?? "Cliente Verificado",
                date: row.date ?? "",
                productHandle: row.product_handle ?? productHandle,
                images: Array.isArray(row.images)
                  ? row.images.filter(Boolean)
                  : row.picture_urls
                    ? String(row.picture_urls).split(',').map((s: string) => s.trim()).filter(Boolean)
                    : []
              }));
              merged = [...merged, ...supaReviews];
            }
          }

          merged.sort((a, b) => {
            const ad = a.date ? new Date(a.date).getTime() : 0;
            const bd = b.date ? new Date(b.date).getTime() : 0;
            return bd - ad;
          });

          setReviews(merged);
        } else {
          console.warn("public/reviews.csv not found.");
        }
      } catch (error) {
        console.error("Failed to process reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productHandle) {
      fetchReviews();
    }
  }, [productHandle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productHandle) return;
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill title and description");
      return;
    }
    setSubmitting(true);
    try {
      if (!supabase) {
        toast.error("Supabase not configured");
        return;
      }
      const bucket = "reviews";
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${productHandle}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (uploadError) {
          toast.error("Failed to upload one of the images");
          continue;
        }
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        }
      }
      const typedUrls = imagesText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const picturesArr = [...uploadedUrls, ...typedUrls];
      const pictures = picturesArr.join(", ");
      const { error } = await supabase
        .from("reviews")
        .insert({
          product_handle: productHandle,
          author: author || "Cliente Verificado",
          title,
          body,
          rating,
          date: new Date().toISOString(),
          picture_urls: pictures,
        });
      if (error) {
        toast.error("Failed to submit review");
        return;
      }
      const newReview: Review = {
        id: `local-${Date.now()}`,
        title,
        body,
        rating,
        author: author || "Cliente Verificado",
        date: new Date().toISOString(),
        productHandle,
        images: picturesArr,
      };
      setReviews((prev) => [newReview, ...prev]);
      setAuthor("");
      setTitle("");
      setBody("");
      setRating(5);
      setImagesText("");
      setFiles([]);
      toast.success("Review submitted");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 pt-16 border-t border-gray-100 flex justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-16 pt-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-8 text-center">Customer Reviews</h2>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 mx-auto max-w-2xl">
          <div className="flex justify-center mb-3">
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">There are no reviews yet for this product.</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Add a review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className={`p-1 rounded ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star className={`w-5 h-5 ${i <= rating ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Your experience" value={body} onChange={(e) => setBody(e.target.value)} />
            <Input placeholder="Image URLs (comma separated)" value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
            <Input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit review"}</Button>
          </form>
        </div>
      </div>
    );
  }

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">What our customers say</h2>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-gray-200"}`} 
              />
            ))}
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-xl text-gray-900">{averageRating}</span>
            <span className="text-sm text-gray-500">/ 5.0</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="text-sm font-medium text-gray-600">{reviews.length} reviews</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, idx) => (
          <div key={`${review.id}-${idx}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{review.author}</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Verified</span>
                  </div>
                </div>
              </div>
              {review.date && (
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
              ))}
            </div>
            {review.title && (
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{review.title}</h3>
            )}
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
              {review.body}
            </p>
            {review.images && review.images.length > 0 && review.images[0] && (
              <div className="mt-auto pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1 font-medium">
                  <ImageIcon className="w-3 h-3" /> Customer photo
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {review.images.map((img, idx2) => (
                    <div key={idx2} className="relative group w-16 h-16 flex-shrink-0 cursor-zoom-in rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={img} 
                        alt={`Customer review photo of ${review.author}`} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-4">Add a review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className={`p-1 rounded ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                <Star className={`w-5 h-5 ${i <= rating ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Your experience" value={body} onChange={(e) => setBody(e.target.value)} />
          <Input placeholder="Image URLs (comma separated)" value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
          <Input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit review"}</Button>
        </form>
      </div>
    </div>
  );
};
