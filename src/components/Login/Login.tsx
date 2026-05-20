import styles from './Login.module.css'

export function Login() {
    return (
        <>
            <section className={styles['container']}>
                <div className={styles['titleContainer']}>
                    <span className={styles['titleText']}>Entrar</span>
                </div>
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
                    <input type="file" />
                </div>
            </section>
        </>
    )
}