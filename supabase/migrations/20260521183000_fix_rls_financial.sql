DO $$
BEGIN
    -- Ensure columns exist as specified in AC
    ALTER TABLE public.capex_acao ADD COLUMN IF NOT EXISTS id_acao INT;
    ALTER TABLE public.capex_acao ADD COLUMN IF NOT EXISTS tempo VARCHAR(7);
    ALTER TABLE public.capex_acao ADD COLUMN IF NOT EXISTS capex DOUBLE PRECISION;

    ALTER TABLE public.capex_perdas ADD COLUMN IF NOT EXISTS tempo VARCHAR(7);
    ALTER TABLE public.capex_perdas ADD COLUMN IF NOT EXISTS capex DOUBLE PRECISION;

    ALTER TABLE public.opex ADD COLUMN IF NOT EXISTS tempo VARCHAR(7);
    ALTER TABLE public.opex ADD COLUMN IF NOT EXISTS opex DOUBLE PRECISION;
END $$;

-- capex_acao policies
DROP POLICY IF EXISTS "Insert capex_acao anon" ON public.capex_acao;
DROP POLICY IF EXISTS "Select capex_acao anon" ON public.capex_acao;
DROP POLICY IF EXISTS "Update capex_acao anon" ON public.capex_acao;
DROP POLICY IF EXISTS "Delete capex_acao anon" ON public.capex_acao;
DROP POLICY IF EXISTS "All capex_acao anon" ON public.capex_acao;
DROP POLICY IF EXISTS "All capex_acao auth" ON public.capex_acao;

CREATE POLICY "All capex_acao anon" ON public.capex_acao FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "All capex_acao auth" ON public.capex_acao FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- capex_perdas policies
DROP POLICY IF EXISTS "Insert capex_perdas anon" ON public.capex_perdas;
DROP POLICY IF EXISTS "Select capex_perdas anon" ON public.capex_perdas;
DROP POLICY IF EXISTS "Update capex_perdas anon" ON public.capex_perdas;
DROP POLICY IF EXISTS "Delete capex_perdas anon" ON public.capex_perdas;
DROP POLICY IF EXISTS "All capex_perdas anon" ON public.capex_perdas;
DROP POLICY IF EXISTS "All capex_perdas auth" ON public.capex_perdas;

CREATE POLICY "All capex_perdas anon" ON public.capex_perdas FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "All capex_perdas auth" ON public.capex_perdas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- opex policies
DROP POLICY IF EXISTS "Insert opex anon" ON public.opex;
DROP POLICY IF EXISTS "Select opex anon" ON public.opex;
DROP POLICY IF EXISTS "Update opex anon" ON public.opex;
DROP POLICY IF EXISTS "Delete opex anon" ON public.opex;
DROP POLICY IF EXISTS "All opex anon" ON public.opex;
DROP POLICY IF EXISTS "All opex auth" ON public.opex;

CREATE POLICY "All opex anon" ON public.opex FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "All opex auth" ON public.opex FOR ALL TO authenticated USING (true) WITH CHECK (true);
