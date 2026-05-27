import { useEffect, useState, useRef, useDeferredValue } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../utils/loginVerify";
import { Toast } from "../Toast/Toast";
import styles from "./CommentsSection.module.css";

interface CommentOwner {
    uuid: string;
    username: string;
    image: string;
}

interface CommentData {
    uuid: string;
    content: string;
    image?: string;
    date: string;
    likes: number;
    owner: CommentOwner;
}

interface CommentsSectionProps {
    postUuid: string;
}

const PRESET_COLORS = [
    { name: "Cyan", hex: "#00e5ff" },
    { name: "Pink", hex: "#ff4081" },
    { name: "Purple", hex: "#d500f9" },
    { name: "Green", hex: "#00e676" },
    { name: "Yellow", hex: "#ffea00" },
    { name: "White", hex: "#ffffff" }
];

const COLOR_MAP: { [key: string]: string } = {
    vermelho: "red",
    azul: "blue",
    verde: "green",
    amarelo: "yellow",
    rosa: "pink",
    roxo: "purple",
    ciano: "cyan",
    branco: "white",
    preto: "black",
    cinza: "gray",
    laranja: "orange"
};

export function CommentsSection({ postUuid }: CommentsSectionProps) {
    const navigate = useNavigate();
    const currentUser = getUserFromToken();

    const [comments, setComments] = useState<CommentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [content, setContent] = useState("");
    const deferredContent = useDeferredValue(content);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchComments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/comments/all/${postUuid}`);
            
            // Handle 404 cleanly as "no comments yet"
            if (response.status === 404) {
                setComments([]);
                return;
            }

            if (!response.ok) {
                throw new Error("Não foi possível carregar os comentários.");
            }

            const data = await response.json();
            
            // Sort comments chronologically (oldest first)
            const sortedComments = Array.isArray(data) 
                ? data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) 
                : [];
            setComments(sortedComments);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro de conexão ao carregar comentários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postUuid]);

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

            // Validate image extension
            const allowedExtensions = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
            const fileExt = file.name.split(".").pop()?.toLowerCase();

            if (!fileExt || !allowedExtensions.includes(fileExt)) {
                setToast({
                    message: "Imagem inválida! Escolha PNG, JPG, JPEG, WEBP, GIF ou SVG.",
                    type: "error"
                });
                setImageFile(null);
                setImagePreview(null);
                setImageBase64("");
                e.target.value = "";
                return;
            }

            try {
                setImageFile(file);
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);

                const base64Str = await fileToBase64(file);
                setImageBase64(base64Str);
            } catch (err) {
                setToast({ message: "Erro ao processar imagem.", type: "error" });
            }
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageBase64("");
        const fileInput = document.getElementById(`comment-image-input-${postUuid}`) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const insertText = (before: string, after: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = before + selected + after;

        const newContent = text.substring(0, start) + replacement + text.substring(end);
        
        // Enforce 1000 char limit on insertion
        if (newContent.length > 1000) {
            setToast({ message: "O comentário não pode exceder 1000 caracteres.", type: "error" });
            return;
        }

        setContent(newContent);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setToast(null);

        if (!currentUser) {
            setToast({ message: "Você precisa estar logado para comentar.", type: "error" });
            return;
        }

        if (content.trim().length === 0) {
            setToast({ message: "Por favor, escreva alguma mensagem no comentário.", type: "error" });
            return;
        }

        if (content.length > 1000) {
            setToast({ message: "O limite máximo é de 1000 caracteres.", type: "error" });
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/comments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: content.trim(),
                    image: imageBase64 || undefined,
                    postUuid: postUuid
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Erro ao publicar comentário.");
            }

            // Reset form
            setContent("");
            handleRemoveImage();
            setToast({ message: "Comentário enviado com sucesso!", type: "success" });

            // Refresh comments list
            fetchComments();
        } catch (err: any) {
            console.error(err);
            setToast({ message: err.message || "Erro de conexão ao enviar comentário.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (e) {
            return "Recente";
        }
    };

    const renderFormattedText = (text: string) => {
        // Escape HTML tags to prevent XSS
        const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Parse formatting tags
        let parsed = escaped
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/__(.*?)__/g, "<u>$1</u>")
            .replace(/~~(.*?)~~/g, "<s>$1</s>")
            .replace(/\[color=(#[0-9a-fA-F]{3,8}|[a-zA-Z\u00C0-\u00FF]+)\](.*?)\[\/color\]/gi, (_match, color, textContent) => {
                const lowerColor = color.toLowerCase();
                const cssColor = COLOR_MAP[lowerColor] || color;
                return `<span style="color: ${cssColor}">${textContent}</span>`;
            })
            .replace(/\n/g, "<br />");

        return <div dangerouslySetInnerHTML={{ __html: parsed }} className={styles.commentContent} />;
    };

    return (
        <div className={styles.commentsSection}>
            <h3 className={styles.sectionTitle}>Comentários</h3>
            <div className={styles.divider} />

            {/* List existing comments */}
            <div className={styles.commentsList}>
                {error && (
                    <div style={{ color: "#ff5252", textAlign: "center", padding: "12px", fontSize: "0.95rem" }}>
                        ⚠️ {error}
                    </div>
                )}
                {loading && comments.length === 0 ? (
                    <div className={styles.loadingComments}>
                        <div className={styles.spinner}></div>
                        <span>Carregando rede de comentários...</span>
                    </div>
                ) : comments.length === 0 ? (
                    <div className={styles.noComments}>
                        <p>Nenhum comentário por aqui ainda. Seja o primeiro a opinar!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.uuid} className={styles.commentCard}>
                            <div className={styles.commentHeader}>
                                <Link to={`/profile/${comment.owner.username}`} className={styles.ownerLink}>
                                    <img 
                                        src={comment.owner.image} 
                                        alt={comment.owner.username} 
                                        className={styles.ownerAvatar}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg";
                                        }}
                                    />
                                    <span className={styles.ownerName}>@{comment.owner.username}</span>
                                </Link>
                                <span className={styles.commentDate}>{formatDate(comment.date)}</span>
                            </div>

                            <div className={styles.commentBody}>
                                {renderFormattedText(comment.content)}
                                
                                {comment.image && (
                                    <div className={styles.commentImageContainer}>
                                        <img 
                                            src={comment.image} 
                                            alt="Imagem do comentário" 
                                            className={styles.commentImage}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create new comment form */}
            <div className={styles.formContainer}>
                {currentUser ? (
                    <form onSubmit={handleSubmit} className={styles.commentForm}>
                        <div className={styles.toolbar}>
                            <button
                                type="button"
                                className={styles.toolbarBtn}
                                onClick={() => insertText("**", "**")}
                                title="Negrito"
                            >
                                <strong>B</strong>
                            </button>
                            <button
                                type="button"
                                className={styles.toolbarBtn}
                                onClick={() => insertText("*", "*")}
                                title="Itálico"
                            >
                                <em>I</em>
                            </button>
                            <button
                                type="button"
                                className={styles.toolbarBtn}
                                onClick={() => insertText("__", "__")}
                                title="Sublinhado"
                            >
                                <u>U</u>
                            </button>
                            <button
                                type="button"
                                className={styles.toolbarBtn}
                                onClick={() => insertText("~~", "~~")}
                                title="Tachado"
                            >
                                <s>S</s>
                            </button>
                            
                            <div className={styles.colorPickerContainer}>
                                <span className={styles.colorLabel}>Cores:</span>
                                <div className={styles.colorPalette}>
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color.hex}
                                            type="button"
                                            className={styles.colorDot}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => insertText(`[color=${color.hex}]`, "[/color]")}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.textareaWrapper}>
                            <textarea
                                ref={textareaRef}
                                id="comment-textarea"
                                className={styles.textarea}
                                placeholder="Participe da conversa... Use Markdown e cores acima! (máx. 1000 caracteres)"
                                value={content}
                                onChange={(e) => setContent(e.target.value.substring(0, 1000))}
                                rows={3}
                                required
                                disabled={isSubmitting}
                            />
                            <div className={styles.charCounter}>
                                <span className={content.length >= 1000 ? styles.counterLimit : ""}>
                                    {content.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* Visualização ao vivo do comentário formatado (desacoplado com useDeferredValue para performance) */}
                        {deferredContent.trim().length > 0 && (
                            <div className={styles.livePreviewContainer}>
                                <div className={styles.previewLabel}>Visualização ao vivo:</div>
                                <div className={styles.previewBox}>
                                    {renderFormattedText(deferredContent)}
                                </div>
                            </div>
                        )}

                        {/* Image upload area */}
                        <div className={styles.imageUploadSection}>
                            <div className={styles.fileInputContainer}>
                                <input
                                    id={`comment-image-input-${postUuid}`}
                                    type="file"
                                    accept="image/*"
                                    className={styles.fileInput}
                                    onChange={handleFileChange}
                                    disabled={isSubmitting}
                                />
                                <span className={styles.fileInputLabel}>
                                    📷 {imageFile ? imageFile.name : "Adicionar Imagem (Opcional)"}
                                </span>
                            </div>

                            {imagePreview && (
                                <div className={styles.previewWrapper}>
                                    <img src={imagePreview} alt="Preview" className={styles.uploadPreview} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={handleRemoveImage}
                                        disabled={isSubmitting}
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.submitWrapper}>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isSubmitting || content.trim().length === 0}
                            >
                                {isSubmitting ? "Comentando..." : "Comentar"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.loginRequired}>
                        <p>Você precisa estar autenticado na Matrix para fazer comentários.</p>
                        <button 
                            className={styles.loginBtn}
                            onClick={() => {
                                // Close all modals by letting body scroll again and redirect
                                document.body.style.overflow = "";
                                navigate("/register");
                            }}
                        >
                            Entrar / Cadastrar
                        </button>
                    </div>
                )}
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
