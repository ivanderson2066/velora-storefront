import { useMemo } from "react";
import { Sparkles, Package, Zap, Star, Gem, CheckCircle2 } from "lucide-react";

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
    let currentSection: ParsedSection | null = null;
    
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
      if (text && text.length > 10) paragraphs.push(text);
    });
    
    // Extract headings
    const headings: string[] = [];
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6, strong, b").forEach(h => {
      const text = h.textContent?.trim();
      if (text && text.length > 3 && text.length < 100) headings.push(text);
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
        items: listItems.slice(0, 8), // Max 8 features
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
    <div className="space-y-16">
      {sections.map((section, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          {section.type === "hero" && (
            <div className="relative">
              {/* Decorative element */}
              <div className="absolute -top-4 left-0 flex items-center gap-2 text-accent">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-medium uppercase tracking-widest">About This Product</span>
              </div>
              
              <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-light mt-8 max-w-3xl">
                {section.content}
              </p>
              
              {/* Elegant divider */}
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                <Gem className="w-4 h-4 text-accent/50" />
                <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
              </div>
            </div>
          )}
          
          {section.type === "features" && section.items && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, i) => (
                  <div 
                    key={i}
                    className="group flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/30 hover:border-accent/30 hover:bg-secondary/50 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {section.type === "gallery" && section.images && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Star className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">Product Gallery</h3>
              </div>
              
              <div className={`grid gap-6 ${
                section.images.length === 1 
                  ? "grid-cols-1" 
                  : section.images.length === 2 
                    ? "grid-cols-1 md:grid-cols-2" 
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}>
                {section.images.map((src, i) => (
                  <div 
                    key={i}
                    className="relative group overflow-hidden rounded-2xl bg-secondary/30 aspect-square"
                  >
                    <img
                      src={src}
                      alt={`${productTitle} - Image ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Elegant overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {section.type === "benefits" && (
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
              </div>
              
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-secondary/50 via-secondary/30 to-transparent border border-border/30">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-accent/20 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-accent/20 rounded-br-3xl" />
                
                <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">
                  {section.content}
                </p>
              </div>
            </div>
          )}
          
          {section.type === "text" && (
            <p className="text-base leading-relaxed text-muted-foreground">
              {section.content}
            </p>
          )}
        </div>
      ))}
      
      {/* Premium footer badge */}
      <div className="flex justify-center pt-8">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border/30">
          <Gem className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Premium Quality Guaranteed
          </span>
        </div>
      </div>
    </div>
  );
};
