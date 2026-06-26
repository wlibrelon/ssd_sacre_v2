DO $$
BEGIN
  -- Add new columns to camadas_mapa
  ALTER TABLE public.camadas_mapa ADD COLUMN IF NOT EXISTS status_importacao TEXT DEFAULT 'pendente';
  ALTER TABLE public.camadas_mapa ADD COLUMN IF NOT EXISTS importado_em TIMESTAMPTZ;
  ALTER TABLE public.camadas_mapa ADD COLUMN IF NOT EXISTS mensagem_erro TEXT;
  ALTER TABLE public.camadas_mapa ADD COLUMN IF NOT EXISTS total_feicoes INTEGER DEFAULT 0;
  ALTER TABLE public.camadas_mapa ADD COLUMN IF NOT EXISTS epsg_origem INTEGER DEFAULT 4674;
END $$;

-- Seed user warlen@librelon.com.br
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'warlen@librelon.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'warlen@librelon.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.perfis_usuarios (id, email, nome, nivel_acesso, status)
    VALUES (new_user_id, 'warlen@librelon.com.br', 'Administrador', 'admin', 'ativo')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Function: importar_feicoes_lote
CREATE OR REPLACE FUNCTION public.importar_feicoes_lote(p_id_camada uuid, p_feicoes jsonb)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.feicoes_geoespaciais (id_camada, geom, nome_feicao, propriedades)
  SELECT
    p_id_camada,
    ST_SetSRID(ST_GeomFromGeoJSON(item->>'geom'), 4326),
    item->>'nome',
    COALESCE(item->'propriedades', '{}'::jsonb)
  FROM jsonb_array_elements(p_feicoes) AS item;

  SELECT count(*) INTO v_count FROM public.feicoes_geoespaciais WHERE id_camada = p_id_camada;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: finalizar_importacao_vetorial
CREATE OR REPLACE FUNCTION public.finalizar_importacao_vetorial(p_id_camada uuid, p_total integer)
RETURNS void AS $$
BEGIN
  UPDATE public.camadas_mapa
  SET
    bbox = (SELECT ST_Envelope(ST_Collect(geom)) FROM public.feicoes_geoespaciais WHERE id_camada = p_id_camada),
    status_importacao = 'importado',
    total_feicoes = p_total,
    importado_em = NOW(),
    mensagem_erro = NULL
  WHERE id_camada = p_id_camada;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
