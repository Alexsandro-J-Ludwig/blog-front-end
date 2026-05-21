import { Header } from "../../components/Header/Header";
import { Login } from "../../components/Login/Login";
import styles from "./RegisterPage.module.css";

export function RegisterPage() {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.pageWrapper}>
                <Login />
            </main>
        </div>
    );
}   