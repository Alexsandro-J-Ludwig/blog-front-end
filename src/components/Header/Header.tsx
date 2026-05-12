import logo from "./../../assets/images/63089224fcb9ed23685b1ae15cc14680-logotipo-do-blog.png"
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
                </div>
            </header>
        </>
    )
}