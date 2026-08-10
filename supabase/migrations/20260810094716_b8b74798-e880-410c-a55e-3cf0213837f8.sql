ALTER TABLE public.products
  ADD CONSTRAINT products_name_not_blank CHECK (length(btrim(name)) > 0),
  ADD CONSTRAINT products_price_positive CHECK (price_cents > 0),
  ADD CONSTRAINT products_currency_format CHECK (currency ~ '^[a-zA-Z]{3}$');