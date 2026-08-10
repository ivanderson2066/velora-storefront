DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_currency_format') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_currency_format CHECK (currency ~ '^[a-zA-Z]{3}$');
  END IF;
END $$;