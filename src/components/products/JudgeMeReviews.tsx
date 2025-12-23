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
        
        // 1. Busca reviews do CSV (Arquivo estático)
        let merged: Review[] = [];
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
          console.warn("Erro ao carregar CSV:", err);
        }

        // 2. Busca reviews do Supabase (Banco de dados)
        if (supabase) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_handle', productHandle)
            .order('created_at', { ascending: false }); // Ordena pelas mais recentes

          if (!error && data) {
            const supaReviews: Review[] = data.map((row: any) => ({
              // Mapeamento das colunas do banco -> Interface Review do código
              id: row.id?.toString() ?? `sb-${Math.random()}`,
              title: row.title ?? "",
              body: row.content ?? "",           // Coluna 'content' do banco vai para 'body'
              rating: Number(row.rating) || 5,
              author: row.name ?? "Cliente Verificado", // Coluna 'name' do banco vai para 'author'
              date: row.created_at ?? new Date().toISOString(), // 'created_at' vai para 'date'
              productHandle: row.product_handle ?? productHandle,
              // 'photo_url' (texto separado por vírgula) vira array de imagens
              images: row.photo_url 
                ? String(row.photo_url).split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
            }));
            merged = [...merged, ...supaReviews];
          }
        }

        // Ordena tudo por data (mais recente primeiro)
        merged.sort((a, b) => {
          const ad = a.date ? new Date(a.date).getTime() : 0;
          const bd = b.date ? new Date(b.date).getTime() : 0;
          return bd - ad;
        });

        setReviews(merged);
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
      toast.error("Por favor, preencha o título e a descrição");
      return;
    }
    setSubmitting(true);
    try {
      if (!supabase) {
        toast.error("Supabase não configurado corretamente");
        return;
      }

      // Upload de imagens (se houver)
      const bucket = "reviews";
      const uploadedUrls: string[] = [];
      
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const path = `${productHandle}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            toast.error(`Erro ao enviar imagem ${file.name}`);
            continue;
          }
          
          const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
          if (publicData?.publicUrl) {
            uploadedUrls.push(publicData.publicUrl);
          }
        }
      }

      const typedUrls = imagesText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      
      const picturesArr = [...uploadedUrls, ...typedUrls];
      const picturesString = picturesArr.join(","); // Junta URLs numa string única para o banco

      // Inserção no Banco de Dados (Usando os nomes corretos das colunas)
      const { error } = await supabase
        .from("reviews")
        .insert({
          product_handle: productHandle,
          name: author || "Cliente Verificado", // Mapeado para 'name'
          title: title,
          content: body,                        // Mapeado para 'content'
          rating: rating,
          photo_url: picturesString,            // Mapeado para 'photo_url'
          verified: true,                       // Define como verificado (opcional)
          // created_at é gerado automaticamente pelo banco
        });

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Erro ao enviar avaliação. Tente novamente.");
        return;
      }

      // Atualiza a interface localmente sem precisar recarregar
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
      
      // Limpa o formulário
      setAuthor("");
      setTitle("");
      setBody("");
      setRating(5);
      setImagesText("");
      setFiles([]);
      toast.success("Avaliação enviada com sucesso!");

    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 pt-16 border-t border-gray-100 flex justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Carregando avaliações...</span>
        </div>
      </div>
    );
  }

  // Se não houver reviews, mostra estado vazio e formulário
  if (reviews.length === 0) {
    return (
      <div className="mt-16 pt-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-8 text-center">Avaliações dos Clientes</h2>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 mx-auto max-w-2xl">
          <div className="flex justify-center mb-3">
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">Ainda não há avaliações para este produto.</p>
          <p className="text-sm text-gray-400 mt-1">Seja o primeiro a compartilhar sua experiência!</p>
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Adicionar avaliação</h3>
          <ReviewForm 
            handleSubmit={handleSubmit}
            author={author} setAuthor={setAuthor}
            title={title} setTitle={setTitle}
            rating={rating} setRating={setRating}
            body={body} setBody={setBody}
            imagesText={imagesText} setImagesText={setImagesText}
            setFiles={setFiles}
            submitting={submitting}
          />
        </div>
      </div>
    );
  }

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">O que os clientes dizem</h2>
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
          <span className="text-sm font-medium text-gray-600">{reviews.length} avaliações</span>
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
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Verificado</span>
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
                  <ImageIcon className="w-3 h-3" /> Foto do cliente
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {review.images.map((img, idx2) => (
                    <div key={idx2} className="relative group w-16 h-16 flex-shrink-0 cursor-zoom-in rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={img} 
                        alt={`Foto da avaliação de ${review.author}`} 
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
        <h3 className="text-xl font-bold mb-4">Adicionar avaliação</h3>
        <ReviewForm 
          handleSubmit={handleSubmit}
          author={author} setAuthor={setAuthor}
          title={title} setTitle={setTitle}
          rating={rating} setRating={setRating}
          body={body} setBody={setBody}
          imagesText={imagesText} setImagesText={setImagesText}
          setFiles={setFiles}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

// Componente auxiliar para o formulário (para evitar repetição)
const ReviewForm = ({ 
  handleSubmit, author, setAuthor, title, setTitle, rating, setRating, body, setBody, imagesText, setImagesText, setFiles, submitting 
}: any) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input placeholder="Seu nome" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <Input placeholder="Título da avaliação" value={title} onChange={(e) => setTitle(e.target.value)} />
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">Sua nota:</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            className={`p-1 rounded transition-colors ${i <= rating ? "text-yellow-400" : "text-gray-300 hover:text-gray-400"}`}
          >
            <Star className={`w-6 h-6 ${i <= rating ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    </div>
    <Textarea placeholder="Conte sobre sua experiência com o produto..." value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
    
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Adicionar fotos (Opcional)</p>
      <Input placeholder="URLs de imagens (separadas por vírgula)" value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
      <div className="text-xs text-gray-400 text-center uppercase font-bold tracking-widest my-2">OU</div>
      <Input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="cursor-pointer" />
    </div>

    <Button type="submit" disabled={submitting} className="w-full">
      {submitting ? "Enviando..." : "Enviar avaliação"}
    </Button>
  </form>
);