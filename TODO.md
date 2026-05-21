## Criar Compoennte - Login
Voce deve incluir as funcionalidades de cadastrar e logar, a funcionalidade de cadastrar deve apenas criar os dados do usuario no banco de dados, se o usuario nao informar uma foto, vai enviar aquela foto padrao encontrada no perfil de cada  usuario criado na semeacao do banco de dados. Ao realizar o cadastro, o usuario deve ser direcionado para a tela de login, ja com o email no campo para ele, precisando apenas informar a senha. Ao realizar o login, o usuario deve ser direcionado para a tela de menu e o token deve ser armazenado no local storage. Na tela de menu, o header deve exibir o usuario logado, sua foto de perfil, e deve ter um botao de logout que remove o token do local storage e redireciona para a tela de login.

- API de cadastro: POST /users/create {name, email, password, image}
- API de login: POST /users/login {email, password}

- Na pasta utils, existe a funcao loginVerify, que e usada para verificar se o token e valido, e retornar os dados do usuario, caso o token nao seja valido, o usuario deve ser redirecionado para a tela de login. Alem disso, ela garante que o usuario tem acesso valido para as rotas que exigem autenticacao. Como curtir posts
- Quando o usuario curtir um post, o post deve ser salvo em uma lista de posts curtidos no local storage, e o contador de likes deve ser incrementado em 1. 

