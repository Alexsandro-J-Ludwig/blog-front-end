import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/loginVerify";
import type { UserTokenPayload } from "../../utils/loginVerify";
import { CreatePostModal } from "../CreatePostModal/CreatePostModal";

export function Header() {
    const [user, setUser] = useState<UserTokenPayload | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setUser(getUserFromToken());

        const handleUpdate = () => {
            setUser(getUserFromToken());
        };
        window.addEventListener("profile-updated", handleUpdate);
        return () => {
            window.removeEventListener("profile-updated", handleUpdate);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/register");
    };

    return (
        <>
            <header className={styles.headerContainer}>
                <div className={styles['navbar']}>

                    <Link to="/" style={{ textDecoration: "none" }}>
                        <span className={styles["title"]}>BlogU</span>
                    </Link>

                    {!user ? (
                        <Link className={styles["linkCadastro"]} to="/register" style={{ textDecoration: "none" }}>
                            <span className={styles["textRegister"]}>Login</span>
                        </Link>
                    ) : (
                        <div className={styles["userSection"]}>
                            <button onClick={() => setIsModalOpen(true)} className={styles["newPostBtn"]}>
                                + Novo Post
                            </button>
                            <Link className={styles["linkCadastro"]} to={`/profile/${user.username}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                                <img 
                                    src={user.image} 
                                    alt={user.username} 
                                    className={styles["avatar"]} 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg";
                                    }} 
                                />
                                <span className={styles["textRegister"]}>{user.username}</span>
                            </Link>
                            <button onClick={handleLogout} className={styles["logoutBtn"]}>
                                Sair
                            </button>
                        </div>
                    )}
                    
                </div>
            </header>

            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}