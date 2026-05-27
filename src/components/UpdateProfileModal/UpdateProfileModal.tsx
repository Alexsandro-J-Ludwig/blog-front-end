import { useState, useEffect } from "react";
import { getUserFromToken } from "../../utils/loginVerify";
import { Toast } from "../Toast/Toast";
import styles from "./UpdateProfileModal.module.css";

interface UpdateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateSuccess: () => void;
}

const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lola"
];

export function UpdateProfileModal({ isOpen, onClose, onUpdateSuccess }: UpdateProfileModalProps) {
    const currentUser = getUserFromToken();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Initialize values when modal opens
    useEffect(() => {
        if (isOpen) {
            const user = getUserFromToken();
            if (user) {
                setUsername(user.username || "");
                setEmail(""); // Keep blank as fallback/placeholder since we don't have email in token
                setPassword("");
                setSelectedImage(user.image || "");
                setImageFile(null);
                setImagePreview(user.image || null);
            }
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

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                e.target.value = ""; // Reset input
                return;
            }

            try {
                setImageFile(file);
                
                // Show local preview URL instantly
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);

                // Convert to base64 for API save in the background
                const base64Str = await fileToBase64(file);
                setSelectedImage(base64Str);
            } catch (err) {
                setToast({ message: "Erro ao processar arquivo de imagem.", type: "error" });
            }
        }
    };

    const handlePresetSelect = (avatarUrl: string) => {
        setImageFile(null);
        setSelectedImage(avatarUrl);
        setImagePreview(avatarUrl);
        
        // Reset file input element if it exists
        const fileInput = document.getElementById("edit-avatar-file") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setToast(null);

        // Validation
        if (username.trim().length < 3) {
            setToast({ message: "O nome de usuário deve ter pelo menos 3 caracteres.", type: "error" });
            return;
        }

        if (password.trim() !== "" && password.trim().length < 6) {
            setToast({ message: "A senha deve ter pelo menos 6 caracteres.", type: "error" });
            return;
        }

        // Check if anything changed
        const hasUsernameChanged = username.trim() !== currentUser.username;
        const hasEmailChanged = email.trim() !== "";
        const hasPasswordChanged = password.trim() !== "";
        const hasImageChanged = selectedImage !== currentUser.image;

        if (!hasUsernameChanged && !hasEmailChanged && !hasPasswordChanged && !hasImageChanged) {
            setToast({ message: "Nenhuma alteração foi realizada.", type: "error" });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: any = {};
            if (hasUsernameChanged) payload.username = username.trim();
            if (hasEmailChanged) payload.email = email.trim();
            if (hasPasswordChanged) payload.password = password.trim();
            if (hasImageChanged) payload.image = selectedImage;

            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/users/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = Array.isArray(data.message)
                    ? data.message.join(", ")
                    : (data.message || "Erro ao atualizar dados.");
                throw new Error(errorMessage);
            }

            // Save overrides locally for immediate UI sync
            const userId = currentUser.uuid || currentUser.id;
            const localOverrides = JSON.parse(
                localStorage.getItem(`user_override_${userId}`) || "{}"
            );
            if (hasUsernameChanged) localOverrides.username = username.trim();
            if (hasImageChanged) localOverrides.image = selectedImage;

            localStorage.setItem(`user_override_${userId}`, JSON.stringify(localOverrides));

            // Notify Header and other listeners to reload token
            window.dispatchEvent(new Event("profile-updated"));

            onUpdateSuccess();
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
                    <h2 className={styles.modalTitle}>Editar Perfil</h2>
                    <button className={styles.closeHeaderBtn} onClick={onClose} aria-label="Fechar">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="edit-username" className={styles.label}>Nome de Usuário</label>
                        <input
                            id="edit-username"
                            type="text"
                            className={styles.input}
                            placeholder="Escolha seu nome de usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="edit-email" className={styles.label}>E-mail</label>
                        <input
                            id="edit-email"
                            type="email"
                            className={styles.input}
                            placeholder="Deixe em branco para manter o atual"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="edit-password" className={styles.label}>Nova Senha</label>
                        <input
                            id="edit-password"
                            type="password"
                            className={styles.input}
                            placeholder="Deixe em branco para manter a atual (mín. 6 caracteres)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Avatar Selection Area */}
                    <div className={styles.avatarSection}>
                        <label className={styles.label}>Foto de Perfil</label>
                        
                        {imagePreview && (
                            <div className={styles.previewWrapper}>
                                <img src={imagePreview} alt="Preview do Perfil" className={styles.avatarPreview} />
                                <span className={styles.previewTag}>Visualização</span>
                            </div>
                        )}

                        <div className={styles.presetTitle}>Escolha um avatar padrão:</div>
                        <div className={styles.presetGrid}>
                            {PRESET_AVATARS.map((avatarUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`${styles.presetBtn} ${selectedImage === avatarUrl ? styles.presetSelected : ""}`}
                                    onClick={() => handlePresetSelect(avatarUrl)}
                                    disabled={isSubmitting}
                                >
                                    <img src={avatarUrl} alt={`Avatar Padrão ${idx + 1}`} className={styles.presetImg} />
                                </button>
                            ))}
                        </div>

                        <div className={styles.divider}>ou</div>

                        <div className={styles.fileInputContainer}>
                            <input
                                id="edit-avatar-file"
                                type="file"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />
                            <span className={styles.fileInputLabel}>
                                {imageFile ? imageFile.name : "Enviar imagem do seu computador..."}
                            </span>
                        </div>
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
                            className={styles.saveBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
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
