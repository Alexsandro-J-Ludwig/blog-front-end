## Criar Compoennte - Login
Voce deve cria um botao ao estilo do BlogU que permita que o usuario crie o seu post, esse botao deve ser de facil visualizacao e deve abrir um modal, dentro do modal o usuario deve poder inserir o titulo do post, o conteudo do post e uma imagem, alem disso, deve ter um botao de cancelar que fecha o modal e um botao de publicar que salva o post no banco de dados, o modal deve ter as seguintes validacoes:
- O titulo deve ter pelo menos 3 caracteres
- O conteudo deve ter pelo menos 10 caracteres
- A imagem deve ser uma imagem valida (nao pode ser .exe, .pdf, .zip, etc)

- API para criar post: POST /post/create {title, content, image, uuid_user}

### Apenas para lembrar os endpoints ja usados (Nao use estes na minha frente, apenas para estudo)
- POST http://localhost:3000/users/create {name, email, password, image}
- POST http://localhost:3000/users/login {email, password}
- GET http://localhost:3000/post/getAll