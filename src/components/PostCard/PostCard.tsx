import type { Post } from "../../hooks/usePosts";
import styles from "./PostCard.module.css";

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888888"><rect width="100%" height="100%" fill="%232c2c2c"/><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>`;
const DEFAULT_POST_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="%23666666"><rect width="100%" height="100%" fill="%231e1e1e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23888888">Imagem indisponivel</text></svg>`;

interface PostCardProps {
    post: Post;
    isLiked: boolean;
    onLike: (postUuid: string) => void;
}

export function PostCard({ post, isLiked, onLike }: PostCardProps) {
    return (
        <article className={styles.postCard}>
            <div className={styles.postHeader}>
                <img
                    src={post.owner.image || DEFAULT_AVATAR}
                    alt={post.owner.username}
                    className={styles.authorAvatar}
                    onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                />
                <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{post.owner.username}</span>
                    <span className={styles.postDate}>
                        {new Date(post.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </span>
                </div>
            </div>

            {post.image && (
                <div className={styles.imageWrapper}>
                    <img
                        src={post.image}
                        alt={post.title}
                        className={styles.postImage}
                        onError={(e) => {
                            e.currentTarget.src = DEFAULT_POST_IMAGE;
                        }}
                    />
                </div>
            )}

            <div className={styles.postBody}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postDescription}>{post.describe}</p>
            </div>

            <div className={styles.postFooter}>
                <button
                    onClick={() => onLike(post.uuid)}
                    className={`${styles.likeBtn} ${isLiked ? styles.liked : ""}`}
                    aria-label="Curtir post"
                >
                    <svg
                        className={styles.heartIcon}
                        viewBox="0 0 24 24"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className={styles.likesCount}>
                        {post.likes} {post.likes === 1 ? "Curtida" : "Curtidas"}
                    </span>
                </button>
            </div>
        </article>
    );
}
