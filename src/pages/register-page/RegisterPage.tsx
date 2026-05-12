import { Header } from "../../components/Header/Header";

export function RegisterPage() {
    return (
        <>
            <Header />

            <section>
                <div>
                    <text>Cadastro de usuário</text>
                </div>

                <div>
                    <label>
                        Nome de Usuário:
                    </label>
                    <input />
                </div>
                <div>
                    <label>
                        Email:
                    </label>
                    <input />
                </div>
                <div>
                    <label>
                        Senha:
                    </label>
                    <input />
                </div>
                <div>
                    <label>
                        Foto de Perfil (opcional):
                    </label>
                    <input type="file"/>
                </div>
            </section>
        </>
    )
}