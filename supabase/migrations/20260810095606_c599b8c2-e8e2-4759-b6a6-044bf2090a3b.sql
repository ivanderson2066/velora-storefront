DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_name_not_blank') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_name_not_blank CHECK (length(btrim(name)) > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_positive') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_price_positive CHECK (price_cents > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_currency_format') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_currency_format CHECK (currency ~ '^[a-zA-Z]{3}$');
  END IF;
END $$;