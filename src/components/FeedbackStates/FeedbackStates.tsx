import styles from "./FeedbackStates.module.css";

export function LoadingState() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Carregando posts...</p>
        </div>
    );
}

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className={styles.errorContainer}>
            <p className={styles.errorText}>⚠️ {message}</p>
            <button onClick={onRetry} className={styles.retryBtn}>
                Tentar Novamente
            </button>
        </div>
    );
}

export function EmptyState() {
    return (
        <div className={styles.emptyContainer}>
            <p className={styles.emptyText}>Nenhuma publicação encontrada no momento.</p>
        </div>
    );
}
