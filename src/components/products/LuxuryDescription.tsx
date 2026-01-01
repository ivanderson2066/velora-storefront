import { useEffect, useMemo, useState, useCallback } from "react";
import { Sparkles, Package, Zap, Star, Gem, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface LuxuryDescriptionProps {
  descriptionHtml?: string;
  description?: string;
  productTitle: string;
}

interface ParsedSection {
  type: "hero" | "features" | "specs" | "benefits" | "gallery" | "text";
  title?: string;
  content: string;
  items?: string[];
  images?: string[];
}

// Gallery Carousel Component
const GalleryCarousel = ({ images, productTitle }: { images: string[]; productTitle: string }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // CORREÇÃO: Usar useEffect em vez de useMemo para side-effects (event listeners)
  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // Define o estado inicial
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 1) {
    return (
      <div className="relative group overflow-hidden rounded-3xl bg-secondary/30 aspect-video max-w-4xl mx-auto">
        <img
          src={images[0]}
          alt={`${productTitle} - Image`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="relative group max-w-5xl mx-auto">
      <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_85%] px-2 first:pl-0 last:pr-0">
              <div className="relative overflow-hidden rounded-2xl bg-secondary/30 aspect-video">
                <img
                  src={src}
                  alt={`${productTitle} - Image ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Elegant overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg z-10"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg z-10"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === selectedIndex 
                ? "bg-foreground w-6" 
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const LuxuryDescription = ({ 
  descriptionHtml, 
  description,
  productTitle 
}: LuxuryDescriptionProps) => {
  
  const parsedContent = useMemo(() => {
    if (!descriptionHtml && !description) return null;
    
    const html = descriptionHtml || `<p>${description}</p>`;
    
    // Parse HTML to extract structured content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    const sections: ParsedSection[] = [];
    
    // Extract images
    const images: string[] = [];
    doc.querySelectorAll("img").forEach(img => {
      const src = img.getAttribute("src");
      if (src) images.push(src);
    });
    
    // Extract lists (features/specs)
    const listItems: string[] = [];
    doc.querySelectorAll("li").forEach(li => {
      const text = li.textContent?.trim();
      if (text) listItems.push(text);
    });
    
    // Extract paragraphs
    const paragraphs: string[] = [];
    doc.querySelectorAll("p").forEach(p => {
      const text = p.textContent?.trim();
      // Filter out short paragraphs or ones that might just be image wrappers
      if (text && text.length > 10) paragraphs.push(text);
    });
    
    // Create hero section from first paragraph
    if (paragraphs.length > 0) {
      sections.push({
        type: "hero",
        content: paragraphs[0],
      });
    }
    
    // Create features section from list items
    if (listItems.length > 0) {
      sections.push({
        type: "features",
        title: "Key Features",
        content: "",
        items: listItems.slice(0, 8),
      });
    }
    
    // Create gallery if multiple images
    if (images.length > 0) {
      sections.push({
        type: "gallery",
        content: "",
        images: images,
      });
    }
    
    // Add remaining paragraphs as benefits
    if (paragraphs.length > 1) {
      sections.push({
        type: "benefits",
        title: "Why You'll Love It",
        content: paragraphs.slice(1, 4).join(" "),
      });
    }
    
    return { sections, rawHtml: html };
  }, [descriptionHtml, description]);

  if (!parsedContent) return null;

  const { sections } = parsedContent;
  
  // Fallback: if no structured sections, render elegant raw HTML
  if (sections.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent/50 to-transparent rounded-full" />
          <div 
            className="pl-6 prose prose-neutral dark:prose-invert max-w-none
              [&_img]:rounded-2xl [&_img]:my-10 [&_img]:w-full [&_img]:max-w-2xl [&_img]:mx-auto [&_img]:shadow-2xl [&_img]:border [&_img]:border-border/10
              [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_p]:mb-6
              [&_ul]:space-y-3 [&_ul]:my-6
              [&_li]:text-muted-foreground [&_li]:pl-2
              [&_strong]:text-foreground [&_strong]:font-semibold
              [&_b]:text-foreground [&_b]:font-semibold
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-foreground
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-foreground
              [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-foreground"
            dangerouslySetInnerHTML={{ __html: parsedContent.rawHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {sections.map((section, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          {section.type === "hero" && (
            <div className="relative max-w-4xl mx-auto text-center">
              {/* Decorative top line */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
                <Sparkles className="w-5 h-5 text-accent" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
              </div>
              
              <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-foreground/90 font-light">
                {section.content}
              </p>
              
              {/* Elegant bottom divider */}
              <div className="mt-12 flex items-center justify-center gap-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
                <Gem className="w-4 h-4 text-accent/50" />
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>
          )}
          
          {section.type === "features" && section.items && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-accent/10 mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{section.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {section.items.map((item, i) => (
                  <div 
                    key={i}
                    className="group relative flex items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/20 hover:border-accent/30 hover:from-secondary/60 hover:to-secondary/30 transition-all duration-500"
                  >
                    {/* Number badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed pt-2">
                      {item}
                    </p>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {section.type === "gallery" && section.images && (
            <div className="space-y-8">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-accent/10 mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Product Gallery</h3>
                <p className="text-sm text-muted-foreground mt-2">Swipe to explore</p>
              </div>
              
              <GalleryCarousel images={section.images} productTitle={productTitle} />
            </div>
          )}
          
          {section.type === "benefits" && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-accent/10 mb-4">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{section.title}</h3>
              </div>
              
              <div className="relative p-10 md:p-12 rounded-3xl bg-gradient-to-br from-secondary/50 via-secondary/30 to-background border border-border/20">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-accent/20 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-accent/20 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-accent/20 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-accent/20 rounded-br-3xl" />
                
                <p className="text-lg leading-relaxed text-muted-foreground text-center">
                  {section.content}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Premium footer badge */}
      <div className="flex justify-center pt-8">
        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-secondary/60 via-secondary/40 to-secondary/60 border border-border/30 shadow-lg">
          <Gem className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium uppercase tracking-[0.15em] text-foreground/80">
            Premium Quality Guaranteed
          </span>
          <Gem className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
};