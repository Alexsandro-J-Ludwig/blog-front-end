import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUserFromToken } from "../../utils/loginVerify";
import { UpdatePostModal } from "../UpdatePostModal/UpdatePostModal";
import { DeletePostModal } from "../DeletePostModal/DeletePostModal";
import { PostViewModal } from "../PostViewModal/PostViewModal";
import styles from "./PostCard.module.css";

export interface PostOwner {
    uuid: string;
    username: string;
    email: string;
    image: string;
}

export interface PostData {
    uuid: string;
    title: string;
    describe: string;
    image: string;
    date: string;
    likes: number;
    owner: PostOwner;
}

interface PostCardProps {
    post: PostData;
}

function PostCardComponent({ post }: PostCardProps) {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // Dropdown and modal states
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Retrieve logged-in user information
    const user = getUserFromToken();

    // Check if the current user is the owner of this post
    const isOwnPost = user && (user.uuid === post.owner.uuid || user.id === post.owner.uuid);

    // Check if the current user has liked this post from localStorage persistency layer
    useEffect(() => {
        if (user) {
            const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${user.uuid}`) || "[]");
            setIsLiked(likedPosts.includes(post.uuid));
        }
    }, [user, post.uuid]);

    // Close dropdown on click outside
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleClose = () => setIsDropdownOpen(false);
        window.addEventListener("click", handleClose);
        return () => window.removeEventListener("click", handleClose);
    }, [isDropdownOpen]);

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDropdownOpen(prev => !prev);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            const confirmLogin = window.confirm("Você precisa estar autenticado para curtir um post. Deseja fazer login?");
            if (confirmLogin) {
                navigate("/register");
            }
            return;
        }

        if (isLiking) return;

        setIsLiking(true);
        // Optimistic update
        const nextLikedState = !isLiked;
        setIsLiked(nextLikedState);
        setLikes(prev => nextLikedState ? prev + 1 : Math.max(0, prev - 1));

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/post/${post.uuid}/like`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Falha ao registrar curtida");
            }

            const updatedPost = await response.json();
            
            // Sync with backend response
            setLikes(updatedPost.likes);
            
            // Persist the liked state locally
            const likedPosts: string[] = JSON.parse(localStorage.getItem(`liked_posts_${user.uuid}`) || "[]");
            if (nextLikedState) {
                if (!likedPosts.includes(post.uuid)) {
                    likedPosts.push(post.uuid);
                }
            } else {
                const index = likedPosts.indexOf(post.uuid);
                if (index > -1) {
                    likedPosts.splice(index, 1);
                }
            }
            localStorage.setItem(`liked_posts_${user.uuid}`, JSON.stringify(likedPosts));
        } catch (error) {
            console.error("Erro ao curtir post:", error);
            // Revert on error
            setIsLiked(!nextLikedState);
            setLikes(prev => nextLikedState ? Math.max(0, prev - 1) : prev + 1);
        } finally {
            setIsLiking(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        } catch (e) {
            return "Recente";
        }
    };

    const hasImage = post.image && post.image.trim() !== "";

    return (
        <>
            <article className={`${styles.card} ${!hasImage ? styles.noImage : ""}`}>
                {hasImage && (
                    <div className={styles.imageWrapper}>
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className={styles.image}
                            loading="lazy"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
                            }}
                        />
                    </div>
                )}

                <div className={styles.content}>
                    <div className={styles.header}>
                        <Link to={`/profile/${post.owner.username}`} className={styles.authorLink}>
                            <img 
                                src={post.owner.image} 
                                alt={post.owner.username} 
                                className={styles.avatar} 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg";
                                }}
                            />
                            <span className={styles.username}>{post.owner.username}</span>
                        </Link>
                        
                        <div className={styles.headerRight}>
                            <span className={styles.date}>{formatDate(post.date)}</span>
                            {isOwnPost && (
                                <div className={styles.actionsContainer}>
                                    <button 
                                        className={styles.ellipsisBtn} 
                                        onClick={toggleDropdown}
                                        aria-label="Opções do post"
                                        title="Opções do post"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.ellipsisIcon}>
                                            <circle cx="12" cy="12" r="1.5"></circle>
                                            <circle cx="6" cy="12" r="1.5"></circle>
                                            <circle cx="18" cy="12" r="1.5"></circle>
                                        </svg>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className={styles.dropdownMenu}>
                                            <button 
                                                className={styles.dropdownItem} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsUpdateOpen(true);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.itemIcon}>
                                                    <path d="M12 20h9"></path>
                                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                </svg>
                                                <span>Atualizar post</span>
                                            </button>
                                            <button 
                                                className={`${styles.dropdownItem} ${styles.deleteItem}`} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDeleteOpen(true);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.itemIcon}>
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                <span>Apagar post</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className={styles.title}>{post.title}</h3>
                    <p className={styles.description}>{post.describe}</p>
                </div>

                <div className={styles.footer}>
                    <button 
                        className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`} 
                        onClick={handleLike}
                        disabled={isLiking}
                        aria-label="Curtir post"
                    >
                        <svg 
                            className={styles.heartIcon} 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className={styles.likeCount}>{likes}</span>
                    </button>

                    <button className={styles.readMoreButton} onClick={() => setIsViewOpen(true)}>
                        <span>Ler Mais</span>
                        <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </article>

            {isUpdateOpen && (
                <UpdatePostModal 
                    post={post}
                    isOpen={isUpdateOpen}
                    onClose={() => setIsUpdateOpen(false)}
                    onUpdateSuccess={() => {
                        setIsUpdateOpen(false);
                    }}
                />
            )}

            {isDeleteOpen && (
                <DeletePostModal 
                    post={post}
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onDeleteSuccess={() => {
                        setIsDeleteOpen(false);
                    }}
                />
            )}

            {isViewOpen && (
                <PostViewModal
                    post={post}
                    isOpen={isViewOpen}
                    onClose={() => setIsViewOpen(false)}
                    initialLiked={isLiked}
                    initialLikes={likes}
                    onLikesChange={(newLikes, newIsLiked) => {
                        setLikes(newLikes);
                        setIsLiked(newIsLiked);
                    }}
                />
            )}
        </>
    );
}

export const PostCard = React.memo(PostCardComponent, (prevProps, nextProps) => {
    return prevProps.post.uuid === nextProps.post.uuid &&
           prevProps.post.likes === nextProps.post.likes &&
           prevProps.post.title === nextProps.post.title &&
           prevProps.post.describe === nextProps.post.describe &&
           prevProps.post.image === nextProps.post.image &&
           prevProps.post.owner.username === nextProps.post.owner.username &&
           prevProps.post.owner.image === nextProps.post.owner.image;
});
