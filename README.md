# BlogU - Front-end 🚀

Este é o repositório front-end da plataforma **BlogU**, uma rede social de microblogging moderna com uma estética futurista, efeitos de neon e interface de vidro soprado (glassmorphism). O projeto foi construído utilizando **React**, **TypeScript** e **Vite**.

---

## 💻 Tecnologias Utilizadas

- **Core**: React 19 & TypeScript
- **Bundler & Dev Server**: Vite 8
- **Estilização**: Vanilla CSS Modules (estilos isolados por componente)
- **Roteamento**: React Router DOM v7
- **Geração de Avatares**: Integração com API Dicebear

---

## 🎨 Funcionalidades Principais

1. **Autenticação de Usuários**:
   - Tela de registro e login com validação de credenciais.
   - Persistência e verificação de token JWT no `localStorage`.
2. **Feed Principal (Linha do Tempo)**:
   - Exibição de postagens em grade responsiva.
   - Atualizações reativas instantâneas ao criar, editar ou excluir publicações.
3. **Criação de Publicações**:
   - Criação de posts com título, conteúdo e upload de imagem de capa em base64.
4. **Gerenciamento de Publicações (Edição e Exclusão)**:
   - Menu suspenso de três pontos (`...`) exclusivo para posts criados pelo próprio usuário logado.
   - Edição de campos de texto e imagem.
   - Exclusão com modal de confirmação e alerta visual de ação irreversível.
5. **Curtidas Reativas (Likes)**:
   - Mecanismo de curtida otimista (resposta visual imediata) com persistência local e sincronização com o banco de dados.
6. **Perfil do Usuário**:
   - Exibição de publicações do usuário e aba de postagens curtidas.
   - Capa cyberpunk gerada deterministicamente com base no nome de usuário.
   - Atualização de dados pessoais (username, email, senha e foto de perfil).
   - Área de perigo para exclusão total da conta (exclui recursivamente todos os posts e depois o perfil).

---

## 📂 Estrutura de Pastas do Projeto

```
src/
├── assets/          # Elementos visuais e imagens estáticas
├── components/      # Componentes reutilizáveis do sistema
│   ├── CreatePostModal/    # Modal para criar novas publicações
│   ├── DeletePostModal/    # Modal de confirmação para deletar posts
│   ├── DeleteProfileModal/ # Modal para exclusão permanente de perfil
│   ├── Header/             # Barra de navegação superior cyberpunk
│   ├── Login/              # Formulários de autenticação de usuários
│   ├── PostCard/           # Card individual contendo as ações e dados do post
│   ├── PostList/           # Gerenciamento da grade de posts no feed principal
│   ├── Toast/              # Notificações pop-up temporárias na tela
│   ├── UpdatePostModal/    # Modal para edição de posts existentes
│   └── UpdateProfileModal/ # Modal para atualização do perfil do usuário
├── pages/           # Telas da aplicação (roteamento)
│   ├── goodbye/            # Tela exibida após exclusão de conta
│   ├── menu/               # Home Page contendo o feed principal
│   ├── profile/            # Perfil do usuário (posts criados/curtidos)
│   └── register-page/      # Tela de login e cadastro
├── utils/           # Funções utilitárias auxiliares
│   └── loginVerify.ts      # Extração, decodificação e validação do token JWT
├── main.tsx         # Ponto de entrada e configuração do React Router
└── index.css        # Variáveis globais de cores cyberpunk, neon e reset de CSS
```

---

## ⚙️ Configuração e Inicialização

### Pré-requisitos
- Node.js (versão 18 ou superior recomendada)
- npm ou yarn

### 1. Instalar as Dependências
Abra o terminal na pasta raiz do projeto e execute:
```bash
npm install
```

### 2. Executar em Ambiente de Desenvolvimento
Para iniciar o servidor local do Vite, execute:
```bash
npm run dev
```
O aplicativo estará disponível por padrão em `http://localhost:5173/` (ou `http://localhost:5174/` se a porta padrão estiver ocupada).

### 3. Compilar para Produção (Build)
Para gerar os arquivos otimizados de produção na pasta `/dist`:
```bash
npm run build
```

---

## 🔌 Integração com o Backend (Endpoints)

O front-end comunica-se com a API do backend (executada localmente na porta `3000`) através dos seguintes endpoints principais:

*   **Autenticação**:
    - `POST http://localhost:3000/users/create` (Cadastro)
    - `POST http://localhost:3000/users/login` (Login/Autenticação)
    - `PUT http://localhost:3000/users/update` (Atualização de dados)
    - `DELETE http://localhost:3000/users/delete` (Remoção da conta)
*   **Publicações (Posts)**:
    - `GET http://localhost:3000/post/getAll` (Obter todas as publicações)
    - `GET http://localhost:3000/post/postUser{username}` (Obter postagens de um usuário específico)
    - `POST http://localhost:3000/post/create` (Criar novo post)
    - `PUT http://localhost:3000/post/alterPost{uuidPost}` (Editar post existente)
    - `DELETE http://localhost:3000/post/{uuidPost}` (Deletar post existente)
    - `POST http://localhost:3000/post/{uuidPost}/like` (Curtir/descurtir post)
