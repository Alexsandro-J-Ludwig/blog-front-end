import { Post } from "../../hooks/usePosts";
import { PostCard } from "../PostCard/PostCard";
import styles from "./PostsGrid.module.css";

interface PostsGridProps {
    posts: Post[];
    likedPostIds: string[];
    onLike: (postUuid: string) => void;
}

export function PostsGrid({ posts, likedPostIds, onLike }: PostsGridProps) {
    return (
        <div className={styles.postsGrid}>
            {posts.map((post) => {
                const isLiked = likedPostIds.includes(post.uuid);
                return (
                    <PostCard
                        key={post.uuid}
                        post={post}
                        isLiked={isLiked}
                        onLike={onLike}
                    />
                );
            })}
        </div>
    );
}
