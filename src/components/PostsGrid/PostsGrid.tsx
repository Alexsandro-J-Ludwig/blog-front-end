import type { Post } from "../../hooks/usePosts";
import { PostCard } from "../PostCard/PostCard";
import styles from "./PostsGrid.module.css";

interface PostsGridProps {
    posts: Post[];
    likedPostIds: string[];
    onLike: (postUuid: string) => void;
}

export function PostsGrid({ posts }: PostsGridProps) {
    return (
        <div className={styles.postsGrid}>
            {posts.map((post) => {
                return (
                    <PostCard
                        key={post.uuid}
                        post={post as any}
                    />
                );
            })}
        </div>
    );
}
