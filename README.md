# Projeto Criado com o Skip

Este projeto foi criado de ponta a ponta com o [Skip](https://goskip.dev).

## 🚀 Stack Tecnológica

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool extremamente rápida
- **TypeScript** - Superset tipado do JavaScript
- **Shadcn UI** - Componentes reutilizáveis e acessíveis
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento para aplicações React
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de schemas TypeScript-first
- **Recharts** - Biblioteca de gráficos para React

## 📋 Pré-requisitos

- Docker e Docker Compose

## 🚀 Instalação e Desenvolvimento (via Docker)

Este projeto foi projetado para ser executado via Docker, garantindo que todo o ambiente (Frontend, Banco de Dados, Auth) esteja configurado corretamente.

### 1. Configuração da Rede
O Docker Compose espera uma rede externa chamada `sacre`. Se ainda não a criou:
```bash
docker network create sacre
```

### 2. Configuração de Variáveis de Ambiente
Crie o arquivo `.env` dentro da pasta `devops/`:
```bash
cp devops/.env.example devops/.env
```

Edite o arquivo `devops/.env` e preencha as variáveis.
- **APP_DOMAIN**: O domínio onde a aplicação rodará (padrão: `https://localhost`).
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Sua chave anônima do Supabase. **(Obrigatório)**

### 3. Execução
Para iniciar o ambiente completo:
```bash
cd devops
docker-compose up -d --build
```

> **Dica**: O parâmetro `--build` é fundamental sempre que você alterar chaves no seu arquivo `.env`, pois o Vite injeta essas variáveis no código durante o build da imagem.

### Serviços Disponíveis
- **Frontend App**: [https://localhost](https://localhost) (ou seu `APP_DOMAIN`)
- **Supabase Studio**: [http://localhost:8082](http://localhost:8082)
- **Banco de Dados**: Porta `5432`

---

## 💻 Scripts de Desenvolvimento (Dentro do Container)

Se precisar rodar comandos dentro do container da aplicação:
```bash
docker exec -it sacre.app sh
```

## 💻 Scripts Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start
# ou
npm run dev
```

Abre a aplicação em modo de desenvolvimento em [http://localhost:5173](http://localhost:5173).

### Build

```bash
# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev
```

Gera os arquivos otimizados para produção na pasta `dist/`.

### Preview

```bash
# Visualizar build de produção localmente
npm run preview
```

Permite visualizar a build de produção localmente antes do deploy.

### Linting e Formatação

```bash
# Executar linter
npm run lint

# Executar linter e corrigir problemas automaticamente
npm run lint:fix

# Formatar código com Oxfmt
npm run format
```

## 📁 Estrutura do Projeto

```
.
├── src/              # Código fonte da aplicação
├── public/           # Arquivos estáticos
├── dist/             # Build de produção (gerado)
├── node_modules/     # Dependências (gerado)
└── package.json      # Configurações e dependências do projeto
```

## 🎨 Componentes UI

Este template inclui uma biblioteca completa de componentes Shadcn UI baseados em Radix UI:

- Accordion
- Alert Dialog
- Avatar
- Button
- Checkbox
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Select
- Switch
- Tabs
- Toast
- Tooltip
- E muito mais...

## 📝 Ferramentas de Qualidade de Código

- **TypeScript**: Tipagem estática
- **Oxlint**: Linter extremamente rápido
- **Oxfmt**: Formatação automática de código

## 🔄 Workflow de Desenvolvimento

1. Instale as dependências: `pnpm install` ou `npm install`
2. Inicie o servidor de desenvolvimento: `pnpm start` ou `npm start`
3. Faça suas alterações
4. Verifique o código: `pnpm run lint` ou `npm run lint`
5. Formate o código: `pnpm run format` ou `npm run format`
6. Crie a build: `pnpm run build` ou `npm run build`
7. Visualize a build: `pnpm run preview` ou `npm run preview`

## 📦 Build e Deploy

Para criar uma build otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/` e estarão prontos para deploy.
