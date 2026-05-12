import { Link } from "react-router-dom"
import styles from "./Header.module.css"

export function Header() {
    return (
        <>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />            </head>
            <header>
                <div className={styles['navbar']}>
                    <Link className="link" to="/" style={{ textDecoration: "none" }}>
                        <text className={styles["title"]}>BlogU</text>
                    </Link>

                    <Link className="linkCadastro" to="/register" style={{ textDecoration: "none" }}>
                        <text className={styles["textRegister"]}>Cadastro</text>
                    </Link>
                </div>
            </header>
        </>
    )
}