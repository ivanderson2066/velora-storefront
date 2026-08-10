DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_name_not_blank') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_name_not_blank CHECK (length(btrim(name)) > 0);
  END IF;
END $$;