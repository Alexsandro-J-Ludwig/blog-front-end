## Criar Compoennte - Atualizar perfil
O sistema deve permitir que o usuario atualize suas informacoes, nome de usuario, email, senha, foto de perfil e capa. A foto de perfil é um caso particular, pois permite que o usuário, possa escolher as imagens padrões de perfil já existentes no sistema, ou enviar uma imagem própria. 

A opcao de editar perfil deve ser feita no botao de editar perfil no perfil do usuario, o botao deve ter um icone de lapis e  seguir o padrao estabelecido em blogU, ele deve abrir um modal para realizar essa edicao, e o modal deve possuir os mesmos campos do modal de criacao de posts, porem com os valores ja preenchidos com as informacoes do usuario.

- API de atualização dos dados do usuário: PUT http://localhost:3000/users/update {name, email, password, image}

### Apenas para lembrar os endpoints ja usados (Nao use estes na minha frente, apenas para estudo)
- POST http://localhost:3000/users/create {name, email, password, image}
- POST http://localhost:3000/users/login {email, password}
- GET http://localhost:3000/post/getAll
- POST http://localhost:3000/post/create {title, content, image, uuid_user}
- GET http://localhost:3000/post/getByUser/{uuid_user}