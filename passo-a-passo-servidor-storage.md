# SACRE — Instalação do Supabase Storage no servidor (stack devops)

A stack do servidor (`devops/docker-compose.yml`) é customizada e não tinha storage.
Os serviços `storage` + `imgproxy` e a rota do nginx foram adicionados ao repositório
(branch `feature`), já usando o volume externo `sacre-storage-data`.
Não há dados antigos para migrar — é instalação nova.

## 1. No PC local: enviar as mudanças

```powershell
cd D:\ssd_sacre_v2
git add devops/docker-compose.yml devops/nginx/conf.d/default.conf
git commit -m "feat: adiciona Supabase Storage (storage-api + imgproxy) com volume externo e rota nginx"
git push origin feature
```

(O script de buckets corrigido já foi enviado em commit anterior.)

## 2. No servidor: atualizar e subir

```bash
cd ~/source/ssd_sacre_v2
git pull

cd devops
docker volume create sacre-storage-data
docker compose up -d storage imgproxy

# Logs devem terminar com o servidor ouvindo na porta 5000, sem erros de migração
docker compose logs storage

# Recarregar a rota nova do nginx
docker compose restart nginx
```

## 3. Verificar o mount

```bash
docker inspect sacre.storage --format '{{json .Mounts}}'
# Deve mostrar "Type":"volume","Name":"sacre-storage-data"
```

## 4. Rodar o script de buckets

Só depois de o storage ter subido pela primeira vez (ele cria/atualiza as tabelas
do schema `storage` na inicialização). O storage fica parado durante o script
(os CREATE POLICY precisam de lock exclusivo em `storage.objects`):

```bash
docker compose stop storage
docker cp ../supabase/migrations/20260630000000_create_buckets.sql sacre.db:/tmp/buckets.sql
docker exec sacre.db psql -U postgres -d postgres -f /tmp/buckets.sql
docker compose start storage
```

Os `CREATE POLICY` não são idempotentes — se rodar duas vezes, dão erro
"already exists" (inofensivo).

## 5. Validar

```bash
# Buckets criados
docker exec sacre.db psql -U postgres -d postgres -c "select id, public from storage.buckets;"

# RLS habilitado (deve retornar t)
docker exec sacre.db psql -U postgres -d postgres -c "select relrowsecurity from pg_class where oid='storage.objects'::regclass;"

# Upload e download de teste pelo app (rota https://<dominio>/supabase/storage/v1/)
```

## 6. Pendências e manutenção

- Warning `The "JkEPI" variable is not set`: alguma senha/valor no `.env` do
  servidor contém `$JkEPI` e o compose substitui por vazio. Localize com
  `grep 'JkEPI' .env` e escape o `$` como `$$`.
- Antes de atualizações futuras da stack: backup do volume
  (`docker run --rm -v sacre-storage-data:/dados:ro -v ~/:/backup alpine tar czf /backup/backup-storage-$(date +%F).tar.gz -C /dados .`)
  e `docker exec sacre.db pg_dump -U postgres -n storage postgres > ~/backup-schema-storage-$(date +%F).sql`
  — os dois precisam estar sincronizados.
- O volume externo não é removido nem por `docker compose down -v`.
