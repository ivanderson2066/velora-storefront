import { Star, Check, User, ThumbsUp, Camera, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { parseReviewsCSV, Review } from "@/lib/csvParser";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface JudgeMeReviewsProps {
  productId: string;
  productTitle?: string;
  productHandle: string;
}

export const JudgeMeReviews = ({ productTitle = "Avaliações", productHandle }: JudgeMeReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);

  // Form States
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [imagesText, setImagesText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // URLs para preview local
  const [submitting, setSubmitting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        let merged: Review[] = [];

        // 1. CSV Import
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

        // 2. Supabase Import
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
              author: row.name ?? "Cliente Verificado",
              date: row.created_at ?? new Date().toISOString(),
              productHandle: row.product_handle ?? productHandle,
              images: row.photo_url 
                ? String(row.photo_url).split(',').map((s: string) => s.trim()).filter(Boolean)
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
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productHandle) fetchReviews();
  }, [productHandle]);

  // Preview de imagens selecionadas (Efeito colateral)
  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrls([]);
      return;
    }
    // Cria URLs temporárias para preview
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);

    // Limpeza de memória
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productHandle) return;
    if (!title.trim() || !body.trim()) {
      toast.error("Por favor, preencha o título e sua opinião.");
      return;
    }
    setSubmitting(true);
    
    try {
      if (!supabase) throw new Error("Supabase não configurado");

      // Upload Images (Só acontece aqui, no submit)
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
        name: author || "Cliente Verificado",
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
        author: author || "Cliente Verificado",
        date: new Date().toISOString(),
        productHandle,
        images: finalImages,
      };

      setReviews([newReview, ...reviews]);
      
      // Reset Form
      setAuthor(""); setTitle(""); setBody(""); setRating(5); setImagesText(""); setFiles([]);
      setIsWriting(false);
      toast.success("Avaliação enviada com sucesso!");

    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  };

  // Paginação Logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Opcional: Scrollar para o topo da lista de reviews
    document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Cálculos Dashboard
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length,
    percentage: reviews.length ? (reviews.filter(r => Math.round(r.rating) === stars).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    // Removido max-w-4xl para usar largura total do container pai (w-full)
    <div id="reviews" className="mt-32 w-full px-0 mb-24 font-sans">
      
      {/* HEADER: Dashboard */}
      <div className="mb-16">
        <h2 className="text-3xl font-light text-center mb-12 tracking-tight text-foreground">
          Avaliações dos Clientes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Nota */}
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
              {reviews.length} Opiniões
            </p>
          </div>

          {/* Barras */}
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

          {/* Botão Ação */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
             <Button 
               onClick={() => setIsWriting(!isWriting)} 
               variant="outline"
               className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-widest text-xs h-12 px-8 transition-all duration-300"
             >
               {isWriting ? "Cancelar" : "Escrever Avaliação"}
             </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-12 opacity-50" />

      {/* FORMULÁRIO */}
      <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isWriting ? "max-h-[1600px] opacity-100 mb-16" : "max-h-0 opacity-0 mb-0"}`}>
        <div className="bg-secondary/10 p-8 md:p-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-center mb-8 uppercase tracking-widest">Compartilhe sua Experiência</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Sua Nota</label>
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
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</label>
                  <Input 
                    placeholder="Seu nome" 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)} 
                    className="bg-transparent border-0 border-b border-muted-foreground/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Título</label>
                  <Input 
                    placeholder="Resumo da sua avaliação" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="bg-transparent border-0 border-b border-muted-foreground/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Opinião</label>
                <Textarea 
                  placeholder="Conte-nos os detalhes..." 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  rows={5}
                  className="bg-transparent border border-muted-foreground/30 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors resize-none p-4"
                />
              </div>

              {/* Upload Minimalista com Preview */}
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Camera className="w-3 h-3" /> Fotos
                </label>
                
                {/* Área de Preview */}
                {previewUrls.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative group w-24 h-24 flex-shrink-0 border border-border">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            const newFiles = files.filter((_, i) => i !== idx);
                            setFiles(newFiles);
                          }}
                          className="absolute top-1 right-1 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <label className="cursor-pointer border border-dashed border-muted-foreground/40 p-8 flex flex-col items-center justify-center gap-2 hover:bg-secondary/20 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Clique para adicionar fotos</span>
                    <Input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files ?? []);
                        setFiles(prev => [...prev, ...newFiles]);
                      }}
                      className="hidden"
                    />
                  </label>
                  
                  {files.length > 0 && (
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> {files.length} imagens prontas para envio
                    </p>
                  )}
                  
                  <div className="pt-2">
                    <Input 
                      placeholder="Ou cole URLs de imagens aqui..." 
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
                  {submitting ? "Enviando..." : "Publicar Avaliação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* LISTA DE AVALIAÇÕES */}
      <div id="reviews-list" className="space-y-16">
        {currentReviews.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground font-light text-lg">Seja o primeiro a avaliar este produto.</p>
          </div>
        ) : (
          currentReviews.map((review) => (
            <div key={review.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-border/30 pb-16 last:border-0 animate-in fade-in duration-700">
              
              {/* Autor Info */}
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
                   <span className="text-[10px] uppercase tracking-wider">Verificado</span>
                </div>
                {review.date && (
                  <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider block mt-2">
                    {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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

                {/* Galeria de Imagens da Review */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative group w-32 h-32 flex-shrink-0 cursor-zoom-in overflow-hidden bg-secondary/10">
                        <img 
                          src={img} 
                          alt="Review visual" 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-6 mt-6 pt-2 opacity-60 hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    <ThumbsUp className="w-3 h-3" /> Útil
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    Reportar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINAÇÃO NUMERADA */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                  className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink 
                    isActive={currentPage === idx + 1}
                    onClick={() => paginate(idx + 1)}
                    className="cursor-pointer"
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                  className={`cursor-pointer ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};