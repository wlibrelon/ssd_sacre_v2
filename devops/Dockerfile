# Estágio de build
FROM node:20-alpine AS build

# Instala o pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Instala as dependências (usando frozen-lockfile para garantir consistência)
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Argumentos de build para o Supabase (Vite precisa disso em tempo de build)
ARG APP_DOMAIN
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Define variáveis de ambiente para o processo de build
ENV VITE_SUPABASE_URL="${VITE_SUPABASE_URL}"
ENV VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY}"

# Gera o build de produção
RUN pnpm run build

# Estágio de produção
FROM nginx:alpine

# Copia o build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia uma configuração básica de Nginx para suportar roteamento SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
