export interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  author: string;
  date: string;
  productHandle: string;
  images?: string[];
}

// Função para ler e processar o CSV do Judge.me/AliExpress
export const parseReviewsCSV = (csvText: string): Review[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  const reviews: Review[] = [];

  // Começa do índice 1 para pular o cabeçalho
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Tenta dividir as colunas respeitando as aspas do CSV
    // A regex procura por conteúdo entre aspas OU texto sem vírgulas
    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    
    // Fallback simples se a regex falhar (dividir por "," que é comum nesse formato)
    const columns = matches || line.split('","').map(s => s.replace(/^"|"$/g, ''));

    if (columns && columns.length > 5) {
      // Limpa as aspas extras de cada coluna
      const cleanCols = columns.map(c => c ? c.replace(/^"|"$/g, '').trim() : '');

      // Mapeamento das colunas baseado no padrão Judge.me
      // 0: Title, 1: Body, 2: Rating, 3: Date, 6: Author, 9: Product Handle, 12: Picture URLs
      
      const title = cleanCols[0];
      const body = cleanCols[1];
      const rating = parseInt(cleanCols[2]) || 5;
      const date = cleanCols[3];
      const author = cleanCols[6] || 'Cliente Verificado';
      const productHandle = cleanCols[9]; 
      const pictureUrl = cleanCols[12];

      // Só adiciona se tiver um handle de produto válido
      if (productHandle) {
        reviews.push({
          id: `csv-review-${i}`,
          title,
          body,
          rating,
          author,
          date,
          productHandle,
          images: pictureUrl ? [pictureUrl] : []
        });
      }
    }
  }

  return reviews;
};