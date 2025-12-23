import { Star, Check, ThumbsUp, Camera, Plus } from "lucide-react";
import { useEffect, useState } from "react";
// Usando caminhos relativos estritos para garantir a resolução
import { parseReviewsCSV, Review } from "../../lib/csvParser";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { toast } from "sonner";

interface JudgeMeReviewsProps {
  productId: string;
  productTitle?: string;
  productHandle: string;
}

export const JudgeMeReviews = ({ productTitle = "Reviews", productHandle }: JudgeMeReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false); // Controla a visibilidade do formulário

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estados do Formulário
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
        let merged: Review[] = [];

        // 1. Importação CSV
        try {
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
            merged = [...productReviews];
          }
        } catch (err) {
          console.warn("CSV Error:", err);
        }

        // 2. Importação Supabase
        if (supabase) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_handle', productHandle)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const supaReviews: Review[] = data.map((row: any) => ({
              id: row.id?.toString() ?? `sb-${Math.random()}`,
              title: row.title ?? "",
              body: row.content ?? "",
              rating: Number(row.rating) || 5,
              author: row.name ?? "Verified Customer",
              date: row.created_at ?? new Date().toISOString(),
              productHandle: row.product_handle ?? productHandle,
              images: row.photo_url 
                ? String(row.photo_url).split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
            }));
            merged = [...merged, ...supaReviews];
          }
        }

        // Ordenação: Mais recentes primeiro (Data decrescente)
        merged.sort((a, b) => {
          const ad = a.date ? new Date(a.date).getTime() : 0;
          const bd = b.date ? new Date(b.date).getTime() : 0;
          return bd - ad;
        });

        setReviews(merged);
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productHandle) fetchReviews();
  }, [productHandle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productHandle) return;
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in the title and your review.");
      return;
    }
    setSubmitting(true);
    
    try {
      if (!supabase) throw new Error("Supabase not configured");

      // Upload de Imagens
      const bucket = "reviews";
      const uploadedUrls: string[] = [];
      
      if (files.length > 0) {
        for (const file of files) {
          const path = `${productHandle}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { contentType: file.type });
          
          if (!uploadError) {
            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
            if (publicData?.publicUrl) uploadedUrls.push(publicData.publicUrl);
          }
        }
      }

      const manualUrls = imagesText.split(",").map(s => s.trim()).filter(s => s.length > 0);
      const finalImages = [...uploadedUrls, ...manualUrls];
      const picturesString = finalImages.join(",");

      const { error } = await supabase.from("reviews").insert({
        product_handle: productHandle,
        name: author || "Verified Customer",
        title,
        content: body,
        rating,
        photo_url: picturesString,
        verified: true,
      });

      if (error) throw error;

      const newReview: Review = {
        id: `local-${Date.now()}`,
        title,
        body,
        rating,
        author: author || "Verified Customer",
        date: new Date().toISOString(),
        productHandle,
        images: finalImages,
      };

      setReviews([newReview, ...reviews]);
      
      // Resetar Formulário
      setAuthor(""); setTitle(""); setBody(""); setRating(5); setImagesText(""); setFiles([]);
      setIsWriting(false); // Fecha o formulário
      toast.success("Review submitted successfully!");

    } catch (err) {
      console.error(err);
      toast.error("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos para o Painel de Estrelas
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length,
    percentage: reviews.length ? (reviews.filter(r => Math.round(r.rating) === stars).length / reviews.length) * 100 : 0
  }));

  // Lógica de Paginação
  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div id="reviews" className="mt-32 max-w-4xl mx-auto px-6 mb-24 font-sans">
      {/* HEADER: Minimalista */}
      <div className="mb-16">
        <h2 className="text-3xl font-light text-center mb-12 tracking-tight text-foreground">
          Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Coluna da Nota (Esquerda) */}
          <div className="md:col-span-3 text-center md:text-left flex flex-col items-center md:items-start">
            <span className="text-6xl font-light text-foreground leading-none mb-2">
              {averageRating}
            </span>
            <div className="flex text-primary mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-muted-foreground/30"}`} 
                />
              ))}
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {reviews.length} Reviews
            </p>
          </div>

          {/* Coluna das Barras (Centro) */}
          <div className="md:col-span-5 space-y-2">
            {ratingCounts.map((item) => (
              <div key={item.stars} className="flex items-center gap-4 text-xs">
                <span className="w-3 text-muted-foreground font-medium">{item.stars}</span>
                <div className="flex-1 h-1 bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Coluna de Ação (Direita) */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
             <Button 
               onClick={() => setIsWriting(!isWriting)} 
               variant="outline"
               className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-widest text-xs h-12 px-8 transition-all duration-300"
             >
               {isWriting ? "Cancel" : "Write a Review"}
             </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-12 opacity-50" />

      {/* FORMULÁRIO */}
      <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isWriting ? "max-h-[1400px] opacity-100 mb-16" : "max-h-0 opacity-0 mb-0"}`}>
        <div className="bg-secondary/10 p-8 md:p-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-center mb-8 uppercase tracking-widest">Share your Experience</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Estrelas Centralizadas */}
              <div className="flex flex-col items-center gap-3">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className="group p-1 focus:outline-none transition-transform active:scale-95"
                    >
                      <Star 
                        className={`w-6 h-6 transition-colors duration-300 ${
                          i <= rating ? "fill-primary text-primary" : "text-muted-foreground/30 group-hover:text-primary/70"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
                  <Input 
                    placeholder="Your name" 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)} 
                    className="bg-transparent border-0 border-b border-muted-foreground/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
                  <Input 
                    placeholder="Summary of your review" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="bg-transparent border-0 border-b border-muted-foreground/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Review</label>
                <Textarea 
                  placeholder="Tell us the details..." 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  rows={5}
                  className="bg-transparent border border-muted-foreground/30 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors resize-none p-4"
                />
              </div>

              {/* Upload Minimalista */}
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Camera className="w-3 h-3" /> Photos
                </label>
                <div className="flex flex-col gap-4">
                  <label className="cursor-pointer border border-dashed border-muted-foreground/40 p-8 flex flex-col items-center justify-center gap-2 hover:bg-secondary/20 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Click to add photos</span>
                    <Input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                      className="hidden"
                    />
                  </label>
                  
                  {files.length > 0 && (
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> {files.length} images selected
                    </p>
                  )}
                  
                  {/* Input de URL Discreto */}
                  <div className="pt-2">
                    <Input 
                      placeholder="Or paste image URLs here..." 
                      value={imagesText} 
                      onChange={(e) => setImagesText(e.target.value)}
                      className="text-xs bg-transparent border-0 border-b border-muted-foreground/20 rounded-none px-0 h-8" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full md:w-auto min-w-[240px] h-12 rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-xs"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* LISTA DE AVALIAÇÕES */}
      <div className="space-y-16">
        {currentReviews.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground font-light text-lg">Be the first to review this product.</p>
          </div>
        ) : (
          currentReviews.map((review) => (
            <div key={review.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-border/30 pb-16 last:border-0 animate-in fade-in duration-700">
              
              {/* Info do Autor (Lateral) */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-8 h-8 rounded-none bg-secondary/30">
                    <AvatarFallback className="bg-transparent text-foreground font-medium text-xs rounded-none">
                      {review.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm text-foreground">{review.author}</p>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/60 mb-1">
                    <Check className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider">Verified</span>
                </div>
                {review.date && (
                  <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider block mt-2">
                    {new Date(review.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Conteúdo */}
              <div className="md:col-span-9 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex text-primary gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-medium text-lg text-foreground tracking-tight">{review.title}</h4>
                )}
                
                <p className="text-muted-foreground leading-relaxed font-light">
                  {review.body}
                </p>

                {/* Galeria de Imagens com Tratamento de Erro */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative group w-32 h-32 flex-shrink-0 cursor-zoom-in overflow-hidden bg-secondary/10">
                        <img 
                          src={img} 
                          alt="Review visual" 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          onError={(e) => {
                            // Oculta o elemento de imagem e seu container pai se a imagem quebrar
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Ações Sutis */}
                <div className="flex items-center gap-6 mt-6 pt-2 opacity-60 hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    <ThumbsUp className="w-3 h-3" /> Helpful
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    Report
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controles de Paginação */}
      {reviews.length > itemsPerPage && (
        <div className="mt-20">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Gerador de Números de Página (1, 2, 3...) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};