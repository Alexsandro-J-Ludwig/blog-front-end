import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../utils/loginVerify";
import type { PostData } from "../PostCard/PostCard";
import { CommentsSection } from "../Comments/CommentsSection";
import styles from "./PostViewModal.module.css";

interface PostViewModalProps {
    post: PostData;
    isOpen: boolean;
    onClose: () => void;
    /** Permite que o modal sincronize o estado de likes com o pai */
    onLikesChange?: (newLikes: number, isLiked: boolean) => void;
    /** Estado de curtida já persistido no PostCard pai */
    initialLiked?: boolean;
    /** Quantidade inicial de likes (pode diferir do post.likes após curtidas rápidas) */
    initialLikes?: number;
}

export function PostViewModal({
    post,
    isOpen,
    onClose,
    onLikesChange,
    initialLiked = false,
    initialLikes,
}: PostViewModalProps) {
    const navigate = useNavigate();
    const user = getUserFromToken();

    const [likes, setLikes] = useState(initialLikes ?? post.likes);
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [isLiking, setIsLiking] = useState(false);

    // Sincroniza estado quando o modal abre
    useEffect(() => {
        if (isOpen) {
            setLikes(initialLikes ?? post.likes);
            setIsLiked(initialLiked);
        }
    }, [isOpen, initialLiked, initialLikes, post.likes]);

    // Fecha com Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        // Bloqueia scroll do body
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            const confirmLogin = window.confirm(
                "Você precisa estar autenticado para curtir um post. Deseja fazer login?"
            );
            if (confirmLogin) navigate("/register");
            return;
        }

        if (isLiking) return;
        setIsLiking(true);

        // Atualização otimista
        const nextLiked = !isLiked;
        setIsLiked(nextLiked);
        const nextLikes = nextLiked ? likes + 1 : Math.max(0, likes - 1);
        setLikes(nextLikes);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/post/${post.uuid}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Falha ao registrar curtida");

            const updatedPost = await response.json();
            setLikes(updatedPost.likes);

            // Persiste localmente
            const key = `liked_posts_${user.uuid}`;
            const likedPosts: string[] = JSON.parse(localStorage.getItem(key) || "[]");
            if (nextLiked) {
                if (!likedPosts.includes(post.uuid)) likedPosts.push(post.uuid);
            } else {
                const idx = likedPosts.indexOf(post.uuid);
                if (idx > -1) likedPosts.splice(idx, 1);
            }
            localStorage.setItem(key, JSON.stringify(likedPosts));

            // Notifica o pai
            onLikesChange?.(updatedPost.likes, nextLiked);
        } catch {
            // Reverte em erro
            setIsLiked(!nextLiked);
            setLikes(nextLiked ? Math.max(0, nextLikes - 1) : nextLikes + 1);
        } finally {
            setIsLiking(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        } catch {
            return "Recente";
        }
    };

    const hasImage = post.image && post.image.trim() !== "";

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Botão fechar */}
                <button
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Fechar post"
                    title="Fechar"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Imagem do post */}
                {hasImage && (
                    <div className={styles.imageWrapper}>
                        <img
                            src={post.image}
                            alt={post.title}
                            className={styles.image}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
                            }}
                        />
                        <div className={styles.imageFade} />
                    </div>
                )}

                <div className={styles.body}>
                    {/* Cabeçalho: autor + data */}
                    <div className={styles.header}>
                        <Link
                            to={`/profile/${post.owner.username}`}
                            className={styles.authorLink}
                            onClick={onClose}
                        >
                            <img
                                src={post.owner.image}
                                alt={post.owner.username}
                                className={styles.avatar}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg";
                                }}
                            />
                            <div className={styles.authorInfo}>
                                <span className={styles.username}>@{post.owner.username}</span>
                                <span className={styles.date}>{formatDate(post.date)}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Título */}
                    <h2 className={styles.title}>{post.title}</h2>

                    {/* Separador decorativo */}
                    <div className={styles.divider} />

                    {/* Descrição completa */}
                    <p className={styles.description}>{post.describe}</p>

                    {/* Rodapé: curtidas */}
                    <div className={styles.footer}>
                        <button
                            className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
                            onClick={handleLike}
                            disabled={isLiking}
                            aria-label={isLiked ? "Descurtir post" : "Curtir post"}
                        >
                            <svg
                                className={styles.heartIcon}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className={styles.likeCount}>{likes}</span>
                            <span className={styles.likeLabel}>
                                {isLiked ? "Curtido" : "Curtir"}
                            </span>
                        </button>
                    </div>

                    {/* Seção de Comentários */}
                    <CommentsSection postUuid={post.uuid} />
                </div>
            </div>
        </div>
    );
}
