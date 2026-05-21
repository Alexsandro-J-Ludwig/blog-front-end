import { Link } from "react-router-dom";
import styles from "./Goodbye.module.css";

export function GoodbyePage() {
    return (
        <div className={styles.container}>
            <div className={styles.gridBackground} />
            <h1 className={styles.glitchText}>Conexão Encerrada</h1>
            <div className={styles.subtitle}>
                <p className={styles.poeticText}>
                    "Suas ideias, suas publicações, seu perfil..."
                </p>
                <p>
                    Tudo foi permanentemente apagado. Seus rastros se dissiparam como poeira de código no vácuo da rede.
                </p>
                <p style={{ marginTop: "20px", color: "#ff8a80", fontWeight: 500 }}>
                    O BlogU sente a sua ausência.
                </p>
            </div>
            <Link to="/register" className={styles.actionBtn}>
                Recomeçar Jornada
            </Link>
        </div>
    );
}
