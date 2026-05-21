import styles from "./WelcomeSection.module.css";

export function WelcomeSection() {
    return (
        <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>Feed de Publicações</h1>
            <p className={styles.welcomeSubtitle}>Explore e interaja com os posts da comunidade</p>
        </div>
    );
}
