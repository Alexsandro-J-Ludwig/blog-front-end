import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginVerify, getCurrentUser } from "../utils/loginVerify";

export interface Post {
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

export function usePosts() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const loggedIn = loginVerify();
    const currentUser = getCurrentUser();

    // Fetch posts from API
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
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

    useEffect(() => {
        fetchPosts();
    }, []);

    // Sync liked posts with localStorage
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
            navigate("/register");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const isLiked = likedPostIds.includes(postUuid);
            const newLikedPostIds = isLiked
                ? likedPostIds.filter((id) => id !== postUuid)
                : [...likedPostIds, postUuid];

            setLikedPostIds(newLikedPostIds);
            localStorage.setItem(`liked_posts_${currentUser.uuid}`, JSON.stringify(newLikedPostIds));

            // Optimistic UI update
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

            // Sync with backend final response
            setPosts((prevPosts) =>
                prevPosts.map((post) => (post.uuid === postUuid ? { ...post, likes: updatedPost.likes } : post))
            );

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

    return {
        posts,
        likedPostIds,
        loading,
        error,
        handleLike,
        retryFetch: fetchPosts,
    };
}
