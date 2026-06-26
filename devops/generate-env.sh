#!/usr/bin/env bash

# Script para gerar o arquivo .env no servidor para o projeto SSD Sacre v2.
# Este script pode ser executado de forma interativa ou automatizada.

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}   Gerador de Arquivo .env - SSD Sacre v2          ${NC}"
echo -e "${BLUE}===================================================${NC}"

# Diretório onde o script está localizado
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_FILE="$DIR/.env"
EXAMPLE_FILE="$DIR/.env.example"

# Flag para modo não-interativo e sobrescrever
NON_INTERACTIVE=false
FORCE=false

# Processar argumentos
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -y|--yes|--non-interactive) NON_INTERACTIVE=true ;;
        -f|--force) FORCE=true ;;
        -h|--help)
            echo "Uso: $0 [opções]"
            echo "Opções:"
            echo "  -y, --yes, --non-interactive   Executa sem fazer perguntas, usando valores padrão ou gerados aleatoriamente."
            echo "  -f, --force                   Sobrescreve o arquivo .env existente sem pedir confirmação."
            echo "  -h, --help                    Mostra esta mensagem de ajuda."
            exit 0
            ;;
        *) echo "Opção desconhecida: $1"; exit 1 ;;
    esac
    shift
done

# Verificar se o arquivo .env já existe
if [ -f "$TARGET_FILE" ] && [ "$FORCE" = false ]; then
    if [ "$NON_INTERACTIVE" = true ]; then
        echo -e "${YELLOW}Aviso: O arquivo .env já existe. Use --force para sobrescrever no modo não-interativo.${NC}"
        exit 0
    else
        read -p "O arquivo .env já existe em $TARGET_FILE. Deseja sobrescrevê-lo? (s/N): " confirm
        if [[ ! "$confirm" =~ ^[sS]$ ]]; then
            echo -e "${YELLOW}Operação cancelada.${NC}"
            exit 0
        fi
    fi
fi

# Função para gerar strings aleatórias
generate_random_string() {
    local length=${1:-24}
    openssl rand -hex "$((length / 2))" 2>/dev/null || tr -dc 'A-Za-z0-9' < /dev/urandom | head -c "$length"
}

# Função para gerar segredo JWT (base64)
generate_jwt_secret() {
    openssl rand -base64 32 2>/dev/null || (tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32 | openssl base64)
}

# Função para assinar JWT usando Python, Node ou OpenSSL
generate_jwt() {
    local role="$1"
    local secret_b64="$2"
    
    # 1. Tentar Python3
    if command -v python3 &>/dev/null; then
        python3 -c "
import hmac, hashlib, base64, json
header = {'alg': 'HS256', 'typ': 'JWT'}
payload = {
    'role': '$role',
    'iss': 'supabase',
    'iat': 1614556800,
    'exp': 2614556800
}
b64url = lambda d: base64.urlsafe_b64encode(d).decode().rstrip('=')
header_part = b64url(json.dumps(header, separators=(',', ':')).encode())
payload_part = b64url(json.dumps(payload, separators=(',', ':')).encode())
msg = f'{header_part}.{payload_part}'.encode()
secret_bytes = base64.b64decode('$secret_b64')
sig = hmac.new(secret_bytes, msg, hashlib.sha256).digest()
print(f'{header_part}.{payload_part}.{b64url(sig)}')
" 2>/dev/null && return
    fi

    # 2. Tentar Node.js
    if command -v node &>/dev/null; then
        node -e "
const crypto = require('crypto');
const header = { alg: 'HS256', typ: 'JWT' };
const payload = {
  role: '$role',
  iss: 'supabase',
  iat: 1614556800,
  exp: 2614556800
};
const b64url = (str_or_buf) => {
  const buf = Buffer.isBuffer(str_or_buf) ? str_or_buf : Buffer.from(str_or_buf);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
const headerPart = b64url(JSON.stringify(header));
const payloadPart = b64url(JSON.stringify(payload));
const msg = headerPart + '.' + payloadPart;
const secretBytes = Buffer.from('$secret_b64', 'base64');
const sig = crypto.createHmac('sha256', secretBytes).update(msg).digest();
console.log(headerPart + '.' + payloadPart + '.' + b64url(sig));
" 2>/dev/null && return
    fi

    # 3. Fallback para OpenSSL em pure Bash
    local header_b64="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    local payload_b64=""
    if [ "$role" = "anon" ]; then
        payload_b64="eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjE0NTU2ODAwLCJleHAiOjI2MTQ1NTY4MDB9"
    else
        payload_b64="eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2MTQ1NTY4MDAsImV4cCI6MjYxNDU1NjgwMH0"
    fi
    local msg="${header_b64}.${payload_b64}"
    local hex_secret
    hex_secret=$(echo -n "$secret_b64" | openssl base64 -d -A | od -An -t x1 | tr -d ' \n' 2>/dev/null || echo "")
    
    if [ -n "$hex_secret" ]; then
        local sig_hex
        sig_hex=$(echo -n "$msg" | openssl dgst -sha256 -mac HMAC -macopt hexkey:"$hex_secret" -hex 2>/dev/null | awk '{print $2}' || echo "")
        if [ -n "$sig_hex" ]; then
            local sig_b64
            sig_b64=$(echo -n "$sig_hex" | sed 's/\(..\)/\\x\1/g' | xargs -0 printf 2>/dev/null | openssl base64 -e 2>/dev/null | tr -d '=' | tr '/+' '_-' | tr -d '\n' || echo "")
            if [ -n "$sig_b64" ]; then
                echo "${msg}.${sig_b64}"
                return
            fi
        fi
    fi

    # Se tudo falhar, usar chave padrão provisória e alertar o usuário
    echo -e "${RED}Erro: Não foi possível gerar a assinatura JWT localmente.${NC}" >&2
    if [ "$role" = "anon" ]; then
        echo "placeholder-anon-key"
    else
        echo "placeholder-service-key"
    fi
}

# Carregar valores padrão/existentes se disponíveis
DEFAULT_APP_DOMAIN="https://localhost"
DEFAULT_INITIAL_ADMIN_EMAIL="admin@projetosacre.org"
DEFAULT_INITIAL_ADMIN_PASSWORD=""
DEFAULT_SMTP_HOST="smtp.example.com"
DEFAULT_SMTP_PORT="587"
DEFAULT_SMTP_USER="smtp-user"
DEFAULT_SMTP_PASS="smtp-password"
DEFAULT_SMTP_ADMIN_EMAIL="admin@example.com"

# Tentar ler valores do .env.example para inicializar
if [ -f "$EXAMPLE_FILE" ]; then
    # Ler do .env.example se existir
    DEFAULT_APP_DOMAIN=$(grep '^APP_DOMAIN=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "https://localhost")
    DEFAULT_INITIAL_ADMIN_EMAIL=$(grep '^INITIAL_ADMIN_EMAIL=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "admin@projetosacre.org")
    DEFAULT_INITIAL_ADMIN_PASSWORD=$(grep '^INITIAL_ADMIN_PASSWORD=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "")
    DEFAULT_SMTP_HOST=$(grep '^GOTRUE_SMTP_HOST=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "smtp.example.com")
    DEFAULT_SMTP_PORT=$(grep '^GOTRUE_SMTP_PORT=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "587")
    DEFAULT_SMTP_USER=$(grep '^GOTRUE_SMTP_USER=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "smtp-user")
    DEFAULT_SMTP_PASS=$(grep '^GOTRUE_SMTP_PASS=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "smtp-password")
    DEFAULT_SMTP_ADMIN_EMAIL=$(grep '^GOTRUE_SMTP_ADMIN_EMAIL=' "$EXAMPLE_FILE" | cut -d'=' -f2- || echo "admin@example.com")
fi

# Inicializar variáveis de input
APP_DOMAIN=""
POSTGRES_PASSWORD=""
JWT_SECRET=""
INITIAL_ADMIN_EMAIL=""
INITIAL_ADMIN_PASSWORD=""
GOTRUE_SMTP_HOST=""
GOTRUE_SMTP_PORT=""
GOTRUE_SMTP_USER=""
GOTRUE_SMTP_PASS=""
GOTRUE_SMTP_ADMIN_EMAIL=""

# Função para fazer perguntas ao usuário
ask_question() {
    local prompt_text="$1"
    local default_val="$2"
    local result_var="$3"
    
    if [ "$NON_INTERACTIVE" = true ]; then
        eval "$result_var=\"$default_val\""
    else
        read -p "$prompt_text [$default_val]: " input_val
        if [ -z "$input_val" ]; then
            eval "$result_var=\"$default_val\""
        else
            eval "$result_var=\"$input_val\""
        fi
    fi
}

# Coleta de informações
echo -e "\n${YELLOW}--- Configuração do Servidor ---${NC}"
ask_question "Domínio da aplicação (ex: https://sacre.meudominio.com)" "$DEFAULT_APP_DOMAIN" APP_DOMAIN

echo -e "\n${YELLOW}--- Configuração do Banco de Dados ---${NC}"
if [ "$NON_INTERACTIVE" = true ]; then
    POSTGRES_PASSWORD=$(generate_random_string 24)
else
    read -p "Senha do Postgres (Pressione Enter para gerar uma senha segura aleatória): " input_pass
    if [ -z "$input_pass" ]; then
        POSTGRES_PASSWORD=$(generate_random_string 24)
        echo -e "Senha gerada: ${GREEN}$POSTGRES_PASSWORD${NC}"
    else
        POSTGRES_PASSWORD="$input_pass"
    fi
fi

echo -e "\n${YELLOW}--- Configuração do Supabase & JWT ---${NC}"
if [ "$NON_INTERACTIVE" = true ]; then
    JWT_SECRET=$(generate_jwt_secret)
else
    read -p "Segredo JWT Supabase (Pressione Enter para gerar um novo segredo seguro de 32 bytes): " input_jwt
    if [ -z "$input_jwt" ]; then
        JWT_SECRET=$(generate_jwt_secret)
        echo -e "JWT Secret gerado com sucesso."
    else
        JWT_SECRET="$input_jwt"
    fi
fi

# Gerar chaves Supabase baseadas no JWT_SECRET
echo "Gerando chaves de API Supabase (VITE_SUPABASE_PUBLISHABLE_KEY e SERVICE_ROLE_KEY)..."
VITE_SUPABASE_PUBLISHABLE_KEY=$(generate_jwt "anon" "$JWT_SECRET")
SERVICE_ROLE_KEY=$(generate_jwt "service_role" "$JWT_SECRET")

echo -e "\n${YELLOW}--- Conta de Administrador Inicial ---${NC}"
ask_question "E-mail do Admin Inicial" "$DEFAULT_INITIAL_ADMIN_EMAIL" INITIAL_ADMIN_EMAIL

if [ "$NON_INTERACTIVE" = true ]; then
    if [ -n "$DEFAULT_INITIAL_ADMIN_PASSWORD" ]; then
        INITIAL_ADMIN_PASSWORD="$DEFAULT_INITIAL_ADMIN_PASSWORD"
    else
        INITIAL_ADMIN_PASSWORD=$(generate_random_string 16)
    fi
else
    read -p "Senha do Admin Inicial [$DEFAULT_INITIAL_ADMIN_PASSWORD] (Pressione Enter para gerar uma aleatória): " input_admin_pass
    if [ -z "$input_admin_pass" ]; then
        if [ -n "$DEFAULT_INITIAL_ADMIN_PASSWORD" ]; then
            INITIAL_ADMIN_PASSWORD="$DEFAULT_INITIAL_ADMIN_PASSWORD"
        else
            INITIAL_ADMIN_PASSWORD=$(generate_random_string 16)
            echo -e "Senha do Admin gerada: ${GREEN}$INITIAL_ADMIN_PASSWORD${NC}"
        fi
    else
        INITIAL_ADMIN_PASSWORD="$input_admin_pass"
    fi
fi

echo -e "\n${YELLOW}--- Configurações de E-mail SMTP (Opcionais) ---${NC}"
ask_question "SMTP Host" "$DEFAULT_SMTP_HOST" GOTRUE_SMTP_HOST
ask_question "SMTP Port" "$DEFAULT_SMTP_PORT" GOTRUE_SMTP_PORT
ask_question "SMTP User" "$DEFAULT_SMTP_USER" GOTRUE_SMTP_USER
if [ "$NON_INTERACTIVE" = true ]; then
    GOTRUE_SMTP_PASS="$DEFAULT_SMTP_PASS"
else
    read -p "SMTP Password [$DEFAULT_SMTP_PASS]: " input_smtp_pass
    if [ -z "$input_smtp_pass" ]; then
        GOTRUE_SMTP_PASS="$DEFAULT_SMTP_PASS"
    else
        GOTRUE_SMTP_PASS="$input_smtp_pass"
    fi
fi
ask_question "E-mail do Remetente SMTP" "$DEFAULT_SMTP_ADMIN_EMAIL" GOTRUE_SMTP_ADMIN_EMAIL

# Gerar arquivo .env
echo -e "\nEscrevendo arquivo .env em $TARGET_FILE..."
cat << EOF > "$TARGET_FILE"
# =========================================================================
# CONFIGURAÇÕES GERADAS AUTOMATICAMENTE PELO SCRIPT EM $(date)
# =========================================================================

# Configurações de Domínio
APP_DOMAIN=$APP_DOMAIN

# Senha do Banco de Dados Postgres (sacre.db)
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Chave secreta JWT para o Supabase (PostgREST, Auth e Studio)
JWT_SECRET=$JWT_SECRET

# Chaves de API do Supabase geradas usando a assinatura da JWT_SECRET
VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Configurações de E-mail para Autenticação (Opcionais)
GOTRUE_SMTP_ADMIN_EMAIL=$GOTRUE_SMTP_ADMIN_EMAIL
GOTRUE_SMTP_HOST=$GOTRUE_SMTP_HOST
GOTRUE_SMTP_PORT=$GOTRUE_SMTP_PORT
GOTRUE_SMTP_USER=$GOTRUE_SMTP_USER
GOTRUE_SMTP_PASS=$GOTRUE_SMTP_PASS

# Configuração opcional de JWT para Auth no Supabase Studio
STUDIO_AUTH_JWT=

# Configurações do Administrador Inicial da Aplicação
INITIAL_ADMIN_EMAIL=$INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_PASSWORD=$INITIAL_ADMIN_PASSWORD
EOF

# Definir permissões seguras para o .env (somente leitura/escrita pelo proprietário)
chmod 600 "$TARGET_FILE"

echo -e "${GREEN}✔ Arquivo .env gerado com sucesso em: $TARGET_FILE${NC}"
echo -e "Permissões de arquivo configuradas como 600 (seguro)."
echo -e "\n${YELLOW}Importante: Salve as seguintes credenciais em local seguro:${NC}"
echo -e "  - Postgres Password: ${GREEN}$POSTGRES_PASSWORD${NC}"
echo -e "  - Admin Email: ${GREEN}$INITIAL_ADMIN_EMAIL${NC}"
echo -e "  - Admin Password: ${GREEN}$INITIAL_ADMIN_PASSWORD${NC}"
echo -e "${BLUE}===================================================${NC}"
