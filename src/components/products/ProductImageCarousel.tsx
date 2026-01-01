import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageCarouselProps {
  images: Array<{
    node: {
      url: string;
      altText: string | null;
    };
  }>;
  productTitle: string;
  selectedIndex?: number;
  onSelectImage?: (index: number) => void;
}

export const ProductImageCarousel = ({
  images,
  productTitle,
  selectedIndex = 0,
  onSelectImage,
}: ProductImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    skipSnaps: false,
    startIndex: selectedIndex 
  });
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setCurrentIndex(index);
    onSelectImage?.(index);
  }, [emblaApi, onSelectImage]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync external selectedIndex changes
  useEffect(() => {
    if (emblaApi && selectedIndex !== currentIndex) {
      emblaApi.scrollTo(selectedIndex);
    }
  }, [selectedIndex, emblaApi, currentIndex]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative group">
        <div className="overflow-hidden rounded-2xl bg-secondary" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {images.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="aspect-square">
                  <img
                    src={img.node.url}
                    alt={img.node.altText || `${productTitle} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Show on hover (desktop) or always (if more than 1 image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/95 backdrop-blur-sm border border-border/50 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-105 shadow-lg active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/95 backdrop-blur-sm border border-border/50 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-105 shadow-lg active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image counter badge */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border/30 text-xs font-medium shadow-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                currentIndex === index
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.node.url}
                alt={img.node.altText || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots indicator (mobile alternative) */}
      {images.length > 1 && images.length <= 6 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "bg-foreground w-6"
                  : "bg-foreground/30 w-1.5"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
