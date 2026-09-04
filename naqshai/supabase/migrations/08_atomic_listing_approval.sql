-- ==========================================
-- NAQSHAI Supabase Migration: 08_atomic_listing_approval.sql
-- Publish a submitted listing atomically.
-- ==========================================

CREATE OR REPLACE FUNCTION public.approve_listing(p_draft_id UUID)
RETURNS TABLE (draft_id UUID, plot_id TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  draft_row public.listing_drafts%ROWTYPE;
  seller_data public.sellers%ROWTYPE;
  seller_info JSONB;
  plot_info JSONB;
  coordinates JSONB;
  uploaded JSONB;
  plot_number TEXT;
  clean_plot_number TEXT;
  base_plot_id TEXT;
  next_plot_id TEXT;
  listing_title TEXT;
  price NUMERIC;
BEGIN
  SELECT * INTO draft_row
  FROM public.listing_drafts
  WHERE id = p_draft_id
    AND status = 'submitted'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only submitted listings can be approved';
  END IF;

  seller_info := COALESCE(draft_row.form_data->'sellerInfo', '{}'::jsonb);
  plot_info := COALESCE(draft_row.form_data->'plotDetails', '{}'::jsonb);
  coordinates := COALESCE(draft_row.form_data->'polygonCoordinates', '[]'::jsonb);
  uploaded := COALESCE(draft_row.form_data->'uploadedFiles', '{}'::jsonb);

  IF NULLIF(BTRIM(seller_info->>'fullName'), '') IS NULL
     OR NULLIF(BTRIM(seller_info->>'phoneNumber'), '') IS NULL
     OR NULLIF(BTRIM(plot_info->>'city'), '') IS NULL
     OR NULLIF(BTRIM(plot_info->>'society'), '') IS NULL
     OR NULLIF(BTRIM(plot_info->>'plotNumber'), '') IS NULL
     OR NULLIF(BTRIM(plot_info->>'pricePkr'), '') IS NULL THEN
    RAISE EXCEPTION 'Listing is missing required fields';
  END IF;

  price := (plot_info->>'pricePkr')::NUMERIC;
  IF price <= 0 THEN
    RAISE EXCEPTION 'Listing price must be greater than zero';
  END IF;

  INSERT INTO public.sellers (
    id, user_id, full_name, phone_number, seller_role, is_identity_verified
  ) VALUES (
    draft_row.user_id,
    draft_row.user_id,
    BTRIM(seller_info->>'fullName'),
    BTRIM(seller_info->>'phoneNumber'),
    COALESCE(NULLIF(BTRIM(seller_info->>'sellerRole'), ''), 'Direct Owner'),
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    seller_role = EXCLUDED.seller_role,
    updated_at = NOW()
  RETURNING * INTO seller_data;

  plot_number := BTRIM(plot_info->>'plotNumber');
  clean_plot_number := REGEXP_REPLACE(plot_number, '^plot[[:space:]_-]*', '', 'i');
  IF clean_plot_number = '' THEN
    clean_plot_number := FLOOR(100 + RANDOM() * 900)::TEXT;
  END IF;

  base_plot_id := 'Plot-' || clean_plot_number;
  next_plot_id := base_plot_id;
  listing_title := 'Plot ' || clean_plot_number || ' - ' || BTRIM(plot_info->>'society') || ', ' || BTRIM(plot_info->>'city');

  WHILE EXISTS (SELECT 1 FROM public.plots WHERE id = next_plot_id) LOOP
    next_plot_id := base_plot_id || '-' || FLOOR(1000 + RANDOM() * 9000)::TEXT;
  END LOOP;

  INSERT INTO public.plots (
    id, seller_id, title, city, price_pkr, size_dimensions, category,
    flood_risk, noise_level, elevation_profile, proximity_notes,
    polygon_coordinates, documents, is_verified
  ) VALUES (
    next_plot_id,
    seller_data.id,
    listing_title,
    BTRIM(plot_info->>'city'),
    price,
    COALESCE(NULLIF(BTRIM(plot_info->>'sizeDimensions'), ''), '10 Marla (35x70)'),
    COALESCE(NULLIF(BTRIM(plot_info->>'category'), ''), 'Residential'),
    'Assessment Pending',
    'Assessment Pending',
    'Pending Survey',
    COALESCE(NULLIF(BTRIM(plot_info->>'proximityNotes'), ''), 'Proximity data under verification'),
    coordinates,
    (
      SELECT COALESCE(jsonb_agg(
        CASE
          WHEN jsonb_typeof(value) = 'object' THEN value->'path'
          ELSE value
        END
      ) FILTER (WHERE value IS NOT NULL), '[]'::jsonb)
      FROM jsonb_each(uploaded)
    ),
    TRUE
  );

  UPDATE public.listing_drafts
  SET status = 'published', published_plot_id = next_plot_id, rejection_reason = NULL
  WHERE id = p_draft_id;

  RETURN QUERY SELECT p_draft_id, next_plot_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_listing(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_listing(UUID) TO service_role;
