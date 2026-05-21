import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { loginVerify } from "../../utils/loginVerify";

export function Header() {
    const [logado, setLogado] = useState(false);

    useEffect(() => {
        setLogado(loginVerify());
    }, []);

    return (
        <>
            <header className={styles.headerContainer}>
                <div className={styles['navbar']}>

                    <Link to="/" style={{ textDecoration: "none" }}>
                        <span className={styles["title"]}>BlogU</span>
                    </Link>

                    {!logado ? (
                        <Link className={styles["linkCadastro"]} to="/register" style={{ textDecoration: "none" }}>
                            <span className={styles["textRegister"]}>Login</span>
                        </Link>
                    ) : (
                        <Link className={styles["linkCadastro"]} to="/profile" style={{ textDecoration: "none" }}>
                            <span className={styles["textRegister"]}>Nome do Usuário</span>
                        </Link>
                    )}
                    
                </div>
            </header>
        </>
    );
}