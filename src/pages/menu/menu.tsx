import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { loginVerify, getCurrentUser } from "../../utils/loginVerify";
import styles from "./menu.module.css";

interface Post {
    uuid: string;
    title: string;
    describe: string;
    image: string;
    date: string;
    likes: number;
    owner: {
        uuid: string;
        username: string;
        email: string;
        image: string;
    };
}

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888888"><rect width="100%" height="100%" fill="%232c2c2c"/><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>`;
const DEFAULT_POST_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="%23666666"><rect width="100%" height="100%" fill="%231e1e1e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23888888">Imagem indisponivel</text></svg>`;

export function Main() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loggedIn = loginVerify();
    const currentUser = getCurrentUser();

    // Load posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("http://localhost:3000/post/getAll");
                if (!response.ok) {
                    throw new Error("Erro ao carregar posts");
                }
                const data = await response.json();
                setPosts(data);
            } catch (err: any) {
                setError(err.message || "Erro de conexão com o servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Load user's liked posts from localStorage
    useEffect(() => {
        if (currentUser) {
            const savedLikes = localStorage.getItem(`liked_posts_${currentUser.uuid}`);
            if (savedLikes) {
                setLikedPostIds(JSON.parse(savedLikes));
            }
        } else {
            setLikedPostIds([]);
        }
    }, [currentUser?.uuid]);

    const handleLike = async (postUuid: string) => {
        if (!loggedIn || !currentUser) {
            // Redirect to login/register if not authenticated
            navigate("/register");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            // Optimistic update
            const isLiked = likedPostIds.includes(postUuid);
            const newLikedPostIds = isLiked
                ? likedPostIds.filter((id) => id !== postUuid)
                : [...likedPostIds, postUuid];

            setLikedPostIds(newLikedPostIds);
            localStorage.setItem(`liked_posts_${currentUser.uuid}`, JSON.stringify(newLikedPostIds));

            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.uuid === postUuid) {
                        return {
                            ...post,
                            likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
                        };
                    }
                    return post;
                })
            );

            const response = await fetch(`http://localhost:3000/post/${postUuid}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao curtir post");
            }

            const updatedPost = await response.json();

            // Sync with backend response
            setPosts((prevPosts) =>
                prevPosts.map((post) => (post.uuid === postUuid ? { ...post, likes: updatedPost.likes } : post))
            );

            // Double check server-side liked status from response
            const serverLiked = updatedPost.likedBy?.some((user: any) => user.uuid === currentUser.uuid);
            if (serverLiked !== undefined) {
                const finalLikedIds = serverLiked
                    ? [...likedPostIds.filter((id) => id !== postUuid), postUuid]
                    : likedPostIds.filter((id) => id !== postUuid);
                setLikedPostIds(finalLikedIds);
                localStorage.setItem(`liked_posts_${currentUser.uuid}`, JSON.stringify(finalLikedIds));
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
        }
    };

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>Feed de Publicações</h1>
                    <p className={styles.welcomeSubtitle}>Explore e interaja com os posts da comunidade</p>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Carregando posts...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorText}>⚠️ {error}</p>
                        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                            Tentar Novamente
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyContainer}>
                        <p className={styles.emptyText}>Nenhuma publicação encontrada no momento.</p>
                    </div>
                ) : (
                    <div className={styles.postsGrid}>
                        {posts.map((post) => {
                            const isLiked = likedPostIds.includes(post.uuid);
                            return (
                                <article key={post.uuid} className={styles.postCard}>
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
                                            onClick={() => handleLike(post.uuid)}
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
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
