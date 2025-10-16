# Sistema de Agendamento para Clínicas

Sistema completo de agendamento para clínicas médicas com frontend em React/TypeScript e backend em Node.js/TypeScript.

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- bcryptjs para hash de senhas

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios para requisições HTTP
- JWT Decode para tokens

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Trabalho-Final-Software-Para-Clinicas-main
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

### 3. Configure o Banco de Dados

1. Crie um banco PostgreSQL chamado `clinica_db`
2. Copie o arquivo `config.example.env` para `.env` e configure as variáveis:
```bash
cp config.example.env .env
```

3. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/clinica_db"
JWT_SECRET="sua_chave_secreta_super_segura_aqui_2024"
PORT=3000
```

4. Execute as migrações do Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Configure o Frontend

```bash
cd ../frontend
npm install
```

## 🚀 Executando o Projeto

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## 📝 Funcionalidades

### Para Pacientes
- Login/autenticação
- Visualizar agendamentos
- Criar novos agendamentos
- Editar agendamentos existentes
- Cancelar agendamentos

### Para Profissionais
- Login/autenticação
- Visualizar agenda
- Gerenciar status dos agendamentos
- Ver detalhes dos pacientes

### Para Recepcionistas
- Gerenciar todos os agendamentos
- Administrar usuários e profissionais

## 🔧 Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Definição das rotas
│   │   ├── middlewares/     # Middlewares de autenticação
│   │   └── types/           # Tipos TypeScript
│   └── prisma/              # Schema e migrações do banco
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Contextos React
│   │   ├── hooks/           # Hooks customizados
│   │   ├── services/        # Serviços de API
│   │   └── utils/           # Utilitários
└── README.md
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Os tokens são armazenados no localStorage do navegador e enviados automaticamente nas requisições.

## 📊 Banco de Dados

O banco de dados inclui as seguintes entidades:
- **Usuario**: Pacientes, profissionais e recepcionistas
- **Profissional**: Dados específicos dos profissionais
- **Especialidade**: Especialidades médicas
- **Agendamento**: Agendamentos de consultas
- **HistoricoStatus**: Histórico de mudanças de status

## 🎨 Interface

A interface foi desenvolvida com Tailwind CSS, proporcionando um design moderno e responsivo.

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em dispositivos móveis, tablets e desktops.

## 🔧 Scripts Disponíveis

### Backend
- `npm run dev`: Executa em modo desenvolvimento
- `npm run build`: Compila o TypeScript
- `npm run start`: Executa a versão compilada
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código

### Frontend
- `npm run dev`: Executa em modo desenvolvimento
- `npm run build`: Compila para produção
- `npm run preview`: Visualiza a build de produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Execute `npx prisma migrate dev` para aplicar as migrações

### Erro de Autenticação
- Verifique se a variável `JWT_SECRET` está configurada
- Limpe o localStorage do navegador

### Erro de CORS
- O backend já está configurado para aceitar requisições do frontend
- Verifique se as portas estão corretas (backend: 3000, frontend: 5173)

## 📄 Licença

Este projeto foi desenvolvido como trabalho final de curso.

