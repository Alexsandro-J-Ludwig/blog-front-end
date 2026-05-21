import { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
    message: string;
    type: "success" | "error";
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <div className={styles.icon}>
                {type === "success" ? "✨" : "⚠️"}
            </div>
            <div className={styles.content}>
                <p className={styles.message}>{message}</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                &times;
            </button>
        </div>
    );
}
