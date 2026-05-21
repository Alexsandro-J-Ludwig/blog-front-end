import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../utils/loginVerify";
import type { PostData } from "../PostCard/PostCard";
import styles from "./DeleteProfileModal.module.css";

interface DeleteProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userPosts: PostData[];
}

export function DeleteProfileModal({ isOpen, onClose, userPosts }: DeleteProfileModalProps) {
    const navigate = useNavigate();
    const currentUser = getUserFromToken();

    const [status, setStatus] = useState<"confirm" | "deleting" | "success" | "error">("confirm");
    const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
    const [deletedCount, setDeletedCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const totalPosts = userPosts.length;

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStatus("confirm");
            setActiveStep(0);
            setDeletedCount(0);
            setErrorMessage("");
        }
    }, [isOpen]);

    // Prevent scrolling when modal is open
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

    if (!isOpen) return null;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleDelete = async () => {
        setStatus("deleting");
        setActiveStep(1);

        const token = localStorage.getItem("token");
        if (!token || !currentUser) {
            setErrorMessage("Sessão inválida. Por favor, faça login novamente.");
            setStatus("error");
            return;
        }

        try {
            // Step 1: Delete all user posts one by one
            for (let i = 0; i < userPosts.length; i++) {
                const post = userPosts[i];
                
                const response = await fetch(`${process.env.URL_API}/post/${post.uuid}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Falha ao excluir o post "${post.title}".`);
                }

                setDeletedCount(i + 1);

                // Dynamic visual feel delay
                const delay = Math.floor(Math.random() * 250) + 150; // 150ms to 400ms
                await sleep(delay);
            }

            // Step 2: Delete the user account
            setActiveStep(2);
            // Longer wait for the profile deletion visual feel
            await sleep(1500);

            const response = await fetch(`${process.env.URL_API}/users/delete`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                const msg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Falha ao deletar conta.");
                throw new Error(msg);
            }

            // Step 3: Success and local cleanup
            setActiveStep(3);
            setStatus("success");
            await sleep(1500);

            // Cleanup local storage
            const userId = currentUser.uuid || currentUser.id;
            localStorage.removeItem("token");
            if (userId) {
                localStorage.removeItem(`user_override_${userId}`);
            }

            // Notify header/listeners
            window.dispatchEvent(new Event("profile-updated"));

            onClose();
            navigate("/goodbye");
        } catch (err: any) {
            console.error(err);
            setErrorMessage(err.message || "Ocorreu um erro ao excluir a conta.");
            setStatus("error");
        }
    };

    const getProgressPercent = () => {
        if (activeStep === 0) return 0;
        if (activeStep === 1) {
            if (totalPosts === 0) return 50;
            return Math.floor((deletedCount / totalPosts) * 50); // first 50% for posts
        }
        if (activeStep === 2) return 80;
        return 100;
    };

    return (
        <div className={styles.modalOverlay} onClick={status === "confirm" || status === "error" ? onClose : undefined}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                {status === "confirm" && (
                    <>
                        <div className={styles.header}>
                            <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className={styles.title}>Zona de Perigo</h2>
                        </div>
                        <div className={styles.content}>
                            <p>Tem certeza de que deseja excluir permanentemente o seu perfil?</p>
                            <div className={styles.warningBox}>
                                <strong>Atenção: Ação Irreversível</strong>
                                Todos os seus posts ({totalPosts}) serão apagados permanentemente do sistema de forma imediata. Seus dados e configurações de perfil também serão deletados.
                            </div>
                        </div>
                        <div className={styles.btnGroup}>
                            <button className={styles.cancelBtn} onClick={onClose}>
                                Cancelar
                            </button>
                            <button className={styles.deleteBtn} onClick={handleDelete}>
                                Confirmar Exclusão
                            </button>
                        </div>
                    </>
                )}

                {status === "deleting" && (
                    <div className={styles.deletingContainer}>
                        <div className={styles.statusMessage}>
                            {activeStep === 1 
                                ? (totalPosts > 0 ? `Limpando suas publicações (${deletedCount}/${totalPosts})...` : "Verificando publicações...") 
                                : "Removendo seu perfil do banco de dados..."
                            }
                        </div>
                        
                        <div className={styles.progressBarContainer}>
                            <div 
                                className={styles.progressBar} 
                                style={{ width: `${getProgressPercent()}%` }}
                            />
                        </div>

                        <div className={styles.stepsList}>
                            <div className={`${styles.stepItem} ${activeStep === 1 ? styles.stepActive : ""} ${activeStep > 1 ? styles.stepCompleted : ""}`}>
                                {activeStep === 1 ? <div className={styles.spinner} /> : activeStep > 1 ? <span className={styles.successCheck}>✓</span> : <div className={styles.pendingDot} />}
                                <span>Excluindo posts do usuário ({deletedCount} de {totalPosts})</span>
                            </div>
                            <div className={`${styles.stepItem} ${activeStep === 2 ? styles.stepActive : ""} ${activeStep > 2 ? styles.stepCompleted : ""}`}>
                                {activeStep === 2 ? <div className={styles.spinner} /> : activeStep > 2 ? <span className={styles.successCheck}>✓</span> : <div className={styles.pendingDot} />}
                                <span>Removendo credenciais e deletando conta</span>
                            </div>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className={styles.deletingContainer}>
                        <div className={styles.statusMessage} style={{ color: "#4caf50" }}>
                            Perfil Deletado com Sucesso!
                        </div>
                        <div className={styles.progressBarContainer}>
                            <div className={styles.progressBar} style={{ width: "100%", background: "#4caf50", boxShadow: "0 0 8px #4caf50" }} />
                        </div>
                        <p style={{ textAlign: "center", color: "#aaa" }}>
                            Sua conexão foi encerrada. Até a próxima...
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <>
                        <div className={styles.header}>
                            <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <h2 className={styles.title} style={{ color: "#ff5252" }}>Erro na Operação</h2>
                        </div>
                        <div className={styles.content}>
                            <p>Não foi possível concluir a exclusão do seu perfil devido ao seguinte erro:</p>
                            <p style={{ color: "#ffab91", marginTop: "12px", background: "rgba(255, 82, 82, 0.05)", padding: "12px", borderRadius: "6px" }}>
                                {errorMessage}
                            </p>
                        </div>
                        <div className={styles.btnGroup}>
                            <button className={styles.cancelBtn} onClick={onClose}>
                                Fechar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
