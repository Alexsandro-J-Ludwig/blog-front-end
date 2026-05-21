import { useState, useEffect } from "react";
import { getUserFromToken } from "../../utils/loginVerify";
import type { PostData } from "../PostCard/PostCard";
import styles from "./DeletePostModal.module.css";

interface DeletePostModalProps {
    post: PostData;
    isOpen: boolean;
    onClose: () => void;
    onDeleteSuccess: () => void;
}

export function DeletePostModal({ post, isOpen, onClose, onDeleteSuccess }: DeletePostModalProps) {
    const currentUser = getUserFromToken();

    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Reset error when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setErrorMessage("");
            setIsDeleting(false);
        }
    }, [isOpen]);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !currentUser) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("Sessão inválida. Por favor, faça login novamente.");
            setIsDeleting(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.URL_API}/post/${post.uuid}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = Array.isArray(data.message)
                    ? data.message.join(", ")
                    : (data.message || "Falha ao excluir o post.");
                throw new Error(msg);
            }

            // Dispatch event to reload feeds
            window.dispatchEvent(new Event("post-deleted"));

            onDeleteSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setErrorMessage(err.message || "Ocorreu um erro ao excluir o post.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={isDeleting ? undefined : onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className={styles.title}>Excluir Publicação</h2>
                </div>

                <div className={styles.content}>
                    <p className={styles.question}>
                        Tem certeza que deseja excluir o post <span className={styles.postTitle}>"{post.title}"</span>?
                    </p>
                    <p className={styles.subtext}>
                        Esta ação é permanente e não poderá ser desfeita. A publicação será removida da Matrix.
                    </p>

                    {errorMessage && (
                        <div className={styles.errorBox}>
                            <strong>Erro: </strong> {errorMessage}
                        </div>
                    )}
                </div>

                <div className={styles.btnGroup}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                    <button
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Excluindo..." : "Excluir Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}
