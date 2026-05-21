import { Header } from "../../components/Header/Header";
import { WelcomeSection } from "../../components/WelcomeSection/WelcomeSection";
import { LoadingState, ErrorState, EmptyState } from "../../components/FeedbackStates/FeedbackStates";
import { PostsGrid } from "../../components/PostsGrid/PostsGrid";
import { usePosts } from "../../hooks/usePosts";
import styles from "./menu.module.css";

export function Main() {
    const { posts, likedPostIds, loading, error, handleLike, retryFetch } = usePosts();

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.mainContent}>
                <WelcomeSection />

                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} onRetry={retryFetch} />
                ) : posts.length === 0 ? (
                    <EmptyState />
                ) : (
                    <PostsGrid
                        posts={posts}
                        likedPostIds={likedPostIds}
                        onLike={handleLike}
                    />
                )}
            </main>
        </div>
    );
}