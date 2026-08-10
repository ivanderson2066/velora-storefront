DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_positive') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_price_positive CHECK (price_cents > 0);
  END IF;
END $$;