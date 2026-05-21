import { useEffect, useState } from "react";
import { PostCard } from "../PostCard/PostCard";
import type { PostData } from "../PostCard/PostCard";
import styles from "./PostList.module.css";

export function PostList() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:3000/post/getAll");
            if (!response.ok) {
                throw new Error("Não foi possível carregar os posts. Tente novamente mais tarde.");
            }
            const data = await response.json();
            setPosts(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();

        const handleNewPost = () => {
            fetchPosts();
        };

        window.addEventListener("post-created", handleNewPost);
        return () => {
            window.removeEventListener("post-created", handleNewPost);
        };
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.grid}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={styles.skeletonCard} aria-hidden="true">
                            <div className={`${styles.skeleton} ${styles.skeletonImage}`} />
                            <div className={styles.skeletonContent}>
                                <div className={styles.skeletonHeader}>
                                    <div className={`${styles.skeleton} ${styles.skeletonAvatar}`} />
                                    <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonAuthor}`} />
                                </div>
                                <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTitle}`} />
                                <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonLine}`} />
                                <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonLine} ${styles.skeletonShortLine}`} />
                            </div>
                            <div className={styles.skeletonFooter}>
                                <div className={`${styles.skeleton} ${styles.skeletonBtn}`} />
                                <div className={`${styles.skeleton} ${styles.skeletonBtn}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3 className={styles.errorTitle}>Ops! Ocorreu um erro</h3>
                    <p className={styles.errorMessage}>{error}</p>
                    <button className={styles.retryButton} onClick={fetchPosts}>
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyContainer}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h3 className={styles.emptyTitle}>Nenhum post por aqui</h3>
                    <p className={styles.emptyMessage}>
                        Parece que nenhum post foi publicado ainda. Seja o primeiro a criar um conteúdo!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {posts.map((post) => (
                    <PostCard key={post.uuid} post={post} />
                ))}
            </div>
        </div>
    );
}
