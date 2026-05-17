# Plano

## 1. Corrigir o erro do checkout (edge function)

O arquivo `supabase/functions/create-checkout/index.ts` importa `corsHeaders` de um caminho inexistente (`npm:@supabase/supabase-js@2/cors`). Isso quebra a função e provavelmente é a causa de erros ao clicar em "Comprar". Vou:

- Definir `corsHeaders` inline no próprio arquivo (padrão Supabase).
- Manter toda a lógica de Stripe Checkout existente.

Observação: o "Script error" genérico no console vem do widget externo da **Judge.me** (cross-origin), não do nosso código — não é corrigível pelo nosso lado.

## 2. Upload de imagem real (em vez de URL)

Hoje o admin só aceita uma URL pública. Vou trocar por upload de arquivo armazenado no backend.

**Migração de banco** (`supabase--migration`):
- Criar bucket público `product-images` em `storage.buckets`.
- Policies em `storage.objects`:
  - Leitura pública para o bucket.
  - INSERT / UPDATE / DELETE apenas para usuários com `has_role(auth.uid(), 'admin')`.

**AdminPage.tsx**:
- Trocar o campo "Image URL" por `<Input type="file" accept="image/*">`.
- Ao salvar: fazer upload via `supabase.storage.from('product-images').upload(...)`, obter `getPublicUrl`, e gravar essa URL em `products.image_url`.
- Mostrar preview da imagem atual ao editar; permitir trocar.
- Adicionar barra de progresso/estado de "Enviando…".

**ProductsPage** e Stripe Checkout continuam funcionando sem mudança — só consomem `image_url`.

## 3. Página que estava faltando

Criar `src/pages/CheckoutCancelPage.tsx` (rota `/checkout/cancel`) para casos onde o cliente cancela o pagamento na Stripe. Atualizar `cancel_url` na edge function para apontar para ela. Adicionar strings nos dicionários `en`/`pt`.

## 4. Arquivos afetados

- `supabase/functions/create-checkout/index.ts` — corrigir import e cancel_url
- `supabase/migrations/...` — bucket + policies de storage
- `src/pages/AdminPage.tsx` — upload de imagem
- `src/pages/CheckoutCancelPage.tsx` — nova página
- `src/App.tsx` — registrar rota `/checkout/cancel`
- `src/lib/i18n.tsx` — novas strings (upload, cancel)

Pronto para implementar?
