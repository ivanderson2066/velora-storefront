import { useState, useRef } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImageCarouselProps {
  images: ShopifyProduct["node"]["images"]["edges"];
  productTitle: string;
  selectedIndex: number;
  onSelectImage: (index: number) => void;
}

// Configuração da animação "Suave" (Spring Physics)
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100, // Entra um pouco deslocado
    opacity: 0,
    scale: 0.95, // Leve zoom in
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100, // Sai para o lado oposto
    opacity: 0,
    scale: 0.95, // Leve zoom out
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const ProductImageCarousel = ({
  images,
  productTitle,
  selectedIndex,
  onSelectImage,
}: ProductImageCarouselProps) => {
  const [isHovering, setIsHovering] = useState(false);
  // Track direction for animation (1 = right/next, -1 = left/prev)
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    const newIndex = selectedIndex + newDirection;
    
    // Check bounds
    if (newIndex >= 0 && newIndex < images.length) {
      onSelectImage(newIndex);
    }
  };

  // Wrapper para setar direção quando clicamos na thumbnail
  const handleThumbnailClick = (index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    onSelectImage(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div 
        className="relative aspect-square overflow-hidden rounded-xl bg-secondary/20 border border-border/50 group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={selectedIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // A MAGIA ESTÁ AQUI: "Spring" em vez de "tween" ou duration fixo
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1); // Swipe Left -> Next
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1); // Swipe Right -> Prev
              }
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <img
              src={images[selectedIndex]?.node.url}
              alt={images[selectedIndex]?.node.altText || productTitle}
              className="w-full h-full object-cover object-center pointer-events-none" // pointer-events-none previne arrastar a imagem fantasma
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIndex > 0) paginate(-1);
              }}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center shadow-sm transition-all duration-300 z-20 hover:bg-background hover:scale-110",
                selectedIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIndex < images.length - 1) paginate(1);
              }}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center shadow-sm transition-all duration-300 z-20 hover:bg-background hover:scale-110",
                selectedIndex === images.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mobile Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 lg:hidden pointer-events-none">
            {images.map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  width: index === selectedIndex ? 24 : 8,
                  opacity: index === selectedIndex ? 1 : 0.5,
                  backgroundColor: index === selectedIndex ? "var(--foreground)" : "var(--foreground)"
                }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x px-1">
          {images.map((image, index) => (
            <button
              key={image.node.url}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 snap-start",
                index === selectedIndex
                  ? "border-foreground opacity-100 ring-2 ring-foreground/20 ring-offset-2 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={image.node.url}
                alt={image.node.altText || `View ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};