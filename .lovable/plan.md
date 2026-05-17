## Plano

1. Corrigir a origem dos produtos exibidos na vitrine
   - A home e a página `/shop` hoje dependem da Storefront API externa, e a requisição está falhando no preview (`Failed to fetch`).
   - Vou criar um fallback usando a tabela `products` do backend do app, que já é alimentada pelo admin e já salva `image_url` permanente do bucket `product-images`.
   - Assim, quando Shopify falhar ou retornar vazio, a vitrine ainda mostra os produtos cadastrados no admin com as imagens salvas.

2. Normalizar o formato dos produtos locais para reaproveitar os componentes existentes
   - Vou adicionar helpers em `src/lib/shopify.ts` para converter produtos do backend local para o formato `ShopifyProduct` já usado por `ProductCard`, carrinho e páginas.
   - Para produto local, criarei uma variante padrão compatível com o carrinho e checkout atual do backend.

3. Evitar imagem quebrada nos cards e carrossel
   - Vou ajustar os componentes de imagem para ter fallback visual quando a URL estiver vazia ou falhar ao carregar.
   - Também vou garantir que o carrossel do detalhe não tente renderizar `src` indefinido quando não houver imagens.

4. Corrigir textos/HTML visíveis no mobile
   - O print mostra `We&apos;re here to help` aparecendo literalmente. Vou trocar por apóstrofo normal para renderizar corretamente.

5. Testar tudo no preview
   - Testar mobile na home: hero, trust bar, seção de produtos e imagens.
   - Testar `/shop`: produtos e imagens.
   - Testar clique em produto/adicionar ao carrinho quando houver produtos.
   - Revisar console e network para confirmar que não há erro novo do app.

## Observação técnica

A imagem do hero está carregando corretamente. O problema principal visível agora é que a Storefront API externa falha no preview, então a grade fica em “No products found”. O fallback para produtos do backend resolve isso e usa as imagens permanentes salvas pelo admin, em vez de depender apenas de URLs externas temporárias.