import { Star, CheckCircle, User, ThumbsUp, Camera, X } from "lucide-react";
import { useEffect, useState } from "react";
import { parseReviewsCSV, Review } from "@/lib/csvParser";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface JudgeMeReviewsProps {
  productId: string;
  productTitle?: string;
  productHandle: string;
}

export const JudgeMeReviews = ({ productTitle = "Avaliações", productHandle }: JudgeMeReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false); // Controla a visibilidade do formulário

  // Form States
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

      // Upload Images
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
      setIsWriting(false); // Fecha o formulário
      toast.success("Avaliação enviada com sucesso!");

    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos para o Dashboard de Estrelas
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
      <div className="py-12 flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div id="reviews" className="mt-24 max-w-5xl mx-auto px-4">
      {/* HEADER: Resumo e Botão de Ação */}
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        {/* Lado Esquerdo: Resumo Geral */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Avaliações dos Clientes</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold text-foreground">{averageRating}</span>
            <div className="space-y-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-gray-200"}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Baseado em {reviews.length} avaliações
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {ratingCounts.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-sm">
                <div className="w-12 text-muted-foreground font-medium flex items-center gap-1">
                  {item.stars} <Star className="w-3 h-3" />
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-muted-foreground text-xs">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lado Direito: Call to Action (Ou Formulário) */}
        <div className="flex-1 flex flex-col justify-center items-start md:items-end border-l border-border/0 md:border-border/50 md:pl-12">
           <div className="bg-secondary/30 p-6 rounded-2xl w-full max-w-sm">
             <h3 className="font-semibold text-lg mb-2">Comprou este produto?</h3>
             <p className="text-sm text-muted-foreground mb-4">
               Compartilhe sua experiência e ajude outros clientes.
             </p>
             <Button 
               onClick={() => setIsWriting(!isWriting)} 
               className="w-full"
               variant={isWriting ? "secondary" : "default"}
             >
               {isWriting ? "Cancelar Avaliação" : "Escrever uma Avaliação"}
             </Button>
           </div>
        </div>
      </div>

      <Separator className="mb-12" />

      {/* FORMULÁRIO (Expansível no Topo com CSS Transitions) */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isWriting ? "max-h-[1200px] opacity-100 mb-16" : "max-h-0 opacity-0 mb-0"}`}>
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Escreva sua avaliação</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsWriting(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avaliação em Estrelas */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Sua nota geral</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    className="group p-1 focus:outline-none transition-transform active:scale-95"
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 group-hover:text-yellow-200"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome (opcional)</label>
                <Input 
                  placeholder="Ex: Maria Silva" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Título da avaliação</label>
                <Input 
                  placeholder="Ex: Amei o produto!" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sua experiência</label>
              <Textarea 
                placeholder="Conte-nos o que você achou da qualidade, entrega, etc." 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                rows={4}
                className="bg-background resize-none"
              />
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" /> Adicionar fotos
              </label>
              <div className="flex flex-col gap-3">
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  className="cursor-pointer file:text-primary file:font-semibold hover:bg-secondary/20 transition-colors"
                />
                {files.length > 0 && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {files.length} arquivo(s) selecionado(s)
                  </p>
                )}
                {/* Fallback de URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">OU via Link</span>
                  </div>
                </div>
                <Input 
                  placeholder="Colar URLs de imagens (separadas por vírgula)" 
                  value={imagesText} 
                  onChange={(e) => setImagesText(e.target.value)}
                  className="text-sm" 
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto min-w-[200px]">
                {submitting ? "Publicando..." : "Publicar Avaliação"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* LISTA DE AVALIAÇÕES (Estilo Vertical Clean) */}
      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-secondary/10 rounded-xl border border-dashed">
            <p className="text-muted-foreground">Nenhuma avaliação ainda. Seja o primeiro!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="flex flex-col md:flex-row gap-6 pb-8 border-b border-border/40 last:border-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Avatar e Autor (Coluna Esquerda Desktop) */}
              <div className="md:w-48 flex-shrink-0 flex md:block items-center gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {review.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="md:hidden">
                    <p className="font-semibold text-sm text-foreground">{review.author}</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Verificado</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="font-semibold text-sm text-foreground mb-1">{review.author}</p>
                  <div className="flex items-center gap-1 text-green-600 mb-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Comprador Verificado</span>
                  </div>
                  {review.date && (
                    <span className="text-xs text-muted-foreground block">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Conteúdo da Avaliação (Coluna Direita Desktop) */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                    ))}
                  </div>
                  {/* Data no Mobile aparece aqui */}
                  {review.date && (
                    <span className="text-xs text-muted-foreground md:hidden">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {review.title && (
                  <h4 className="font-bold text-foreground">{review.title}</h4>
                )}
                
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                  {review.body}
                </p>

                {/* Imagens da Avaliação */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 pt-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative group w-24 h-24 flex-shrink-0 cursor-zoom-in rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
                        <img 
                          src={img} 
                          alt="Foto do cliente" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Botões de Ação (Fake para estética) */}
                <div className="flex items-center gap-4 mt-4 pt-2">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                    <ThumbsUp className="w-3.5 h-3.5 group-hover:text-primary" /> Útil
                  </button>
                  <span className="text-border text-xs">|</span>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Reportar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {reviews.length > 5 && (
        <div className="mt-12 text-center">
          <Button variant="outline" className="min-w-[200px]">Carregar mais avaliações</Button>
        </div>
      )}
    </div>
  );
};