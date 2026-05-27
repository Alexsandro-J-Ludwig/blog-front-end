import { useState, useEffect } from "react";
import { getUserFromToken } from "../../utils/loginVerify";
import { Toast } from "../Toast/Toast";
import styles from "./CreatePostModal.module.css";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
    const [title, setTitle] = useState("");
    const [describe, setDescribe] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

    if (!isOpen) return null;

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate extension
            const allowedExtensions = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
            const fileExt = file.name.split(".").pop()?.toLowerCase();

            if (!fileExt || !allowedExtensions.includes(fileExt)) {
                setToast({
                    message: "Arquivo inválido! Por favor, selecione uma imagem (PNG, JPG, JPEG, WEBP, GIF, SVG).",
                    type: "error"
                });
                setImageFile(null);
                setImagePreview(null);
                e.target.value = ""; // Reset input
                return;
            }

            setImageFile(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setToast(null);

        const user = getUserFromToken();
        if (!user) {
            setToast({ message: "Sessão expirada. Faça login novamente.", type: "error" });
            return;
        }

        // Title validation (Must be between 5 and 100 characters according to DTO)
        if (title.trim().length < 5) {
            setToast({ message: "O título é muito curto (mínimo de 5 caracteres).", type: "error" });
            return;
        }
        if (title.trim().length > 150) {
            setToast({ message: "O título é muito longo (máximo de 150 caracteres).", type: "error" });
            return;
        }

        // Describe validation (Must be between 2 and 500 characters according to DTO)
        if (describe.trim().length < 2) {
            setToast({ message: "A descrição deve ter pelo menos 2 caracteres.", type: "error" });
            return;
        }
        if (describe.trim().length > 1500) {
            setToast({ message: "A descrição é muito longa (máximo de 1500 caracteres).", type: "error" });
            return;
        }

        setIsSubmitting(true);

        try {
            const imageBase64 = imageFile ? await fileToBase64(imageFile) : "";
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:3000/post/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    describe,
                    image: imageBase64
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = Array.isArray(data.message)
                    ? data.message.join(", ")
                    : (data.message || "Erro ao publicar o post.");
                throw new Error(errorMessage);
            }

            // Dispatch event to notify PostList to reload
            window.dispatchEvent(new Event("post-created"));

            // Reset form
            setTitle("");
            setDescribe("");
            setImageFile(null);
            setImagePreview(null);

            // Toast success will be displayed on the page
            // We close the modal after a tiny delay so they can see success or close immediately
            onClose();
        } catch (err: any) {
            console.error(err);
            setToast({ message: err.message || "Erro ao conectar com o servidor.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Novo Post</h2>
                    <button className={styles.closeHeaderBtn} onClick={onClose} aria-label="Fechar">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="post-title" className={styles.label}>Título</label>
                        <input
                            id="post-title"
                            type="text"
                            className={styles.input}
                            placeholder="Digite o título do seu post (mín. 3 caracteres)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="post-describe" className={styles.label}>Descrição</label>
                        <textarea
                            id="post-describe"
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Escreva a descrição do post (mín. 2 e máx. 500 caracteres)"
                            value={describe}
                            onChange={(e) => setDescribe(e.target.value)}
                            rows={5}
                            required
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Imagem de Capa (Opcional)</label>
                        <div className={styles.fileInputContainer}>
                            <input
                                id="post-image"
                                type="file"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            <span className={styles.fileInputLabel}>
                                {imageFile ? imageFile.name : "Selecionar imagem..."}
                            </span>
                        </div>
                        {imagePreview && (
                            <div className={styles.previewContainer}>
                                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                            </div>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.publishBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Publicando..." : "Publicar"}
                        </button>
                    </div>
                </form>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
