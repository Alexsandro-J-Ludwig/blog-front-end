import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { loginVerify, getCurrentUser } from "../../utils/loginVerify";

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888888"><rect width="100%" height="100%" fill="%232c2c2c"/><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>`;

export function Header() {
    const [usuario, setUsuario] = useState<{ username: string; image?: string } | null>(null);

    useEffect(() => {
        if (loginVerify()) {
            setUsuario(getCurrentUser());
        } else {
            setUsuario(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUsuario(null);
        window.location.href = "/";
    };

    return (
        <>
            <header className={styles.headerContainer}>
                <div className={styles['navbar']}>

                    <Link to="/" style={{ textDecoration: "none" }}>
                        <span className={styles["title"]}>BlogU</span>
                    </Link>

                    {!usuario ? (
                        <Link className={styles["linkCadastro"]} to="/register" style={{ textDecoration: "none" }}>
                            <span className={styles["textRegister"]}>Login</span>
                        </Link>
                    ) : (
                        <div className={styles["userInfoContainer"]}>
                            <img 
                                src={usuario.image || DEFAULT_AVATAR} 
                                alt={usuario.username} 
                                className={styles["avatar"]} 
                                onError={(e) => {
                                    e.currentTarget.src = DEFAULT_AVATAR;
                                }}
                            />
                            <span className={styles["usernameText"]}>{usuario.username}</span>
                            <button onClick={handleLogout} className={styles["logoutBtn"]}>
                                Sair
                            </button>
                        </div>
                    )}
                    
                </div>
            </header>
        </>
    );
}