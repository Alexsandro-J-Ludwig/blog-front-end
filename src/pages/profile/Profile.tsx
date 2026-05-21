import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { PostCard } from "../../components/PostCard/PostCard";
import { getUserFromToken } from "../../utils/loginVerify";
import type { PostData } from "../../components/PostCard/PostCard";
import styles from "./Profile.module.css";

export function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const currentUser = getUserFromToken();

    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [likedPosts, setLikedPosts] = useState<PostData[]>([]);
    const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "likes">("newest");
    const [isLoading, setIsLoading] = useState(true);
    const [userNotFound, setUserNotFound] = useState(false);
    
    // User profile info (fallback to token if own profile, or loaded from posts owner)
    const [profileUser, setProfileUser] = useState<{ username: string; image: string } | null>(null);

    const isOwnProfile = currentUser?.username === username;

    // Deterministic cyberpunk gradient cover generator based on username
    const getCyberpunkGradient = (name: string) => {
        const gradients = [
            "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", // Cyber Teal
            "linear-gradient(135deg, #2d0b3d, #4b0082, #1b003a)", // Deep Purple
            "linear-gradient(135deg, #050505, #110022, #2a0055)", // Neon Purple Dark
            "linear-gradient(135deg, #0d0d1a, #001f3f, #005f73)", // Cyber Blue
            "linear-gradient(135deg, #1b001b, #3d003d, #6b006b)", // Magenta Gloom
            "linear-gradient(135deg, #121212, #222222, #00e5ff)", // Synthwave Cyan
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    };

    useEffect(() => {
        if (!username) return;

        const fetchProfileData = async () => {
            setIsLoading(true);
            setUserNotFound(false);
            try {
                // 1. Fetch user's posts
                const response = await fetch(`http://localhost:3000/post/postUser${username}`);
                
                if (response.status === 404) {
                    setUserNotFound(true);
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error("Erro ao carregar os dados do perfil.");
                }

                const posts: PostData[] = await response.json();
                setUserPosts(posts);

                // Set profile user info based on posts owner if available
                if (posts.length > 0) {
                    setProfileUser({
                        username: posts[0].owner.username,
                        image: posts[0].owner.image
                    });
                } else {
                    // Fallback if user exists but has 0 posts
                    if (isOwnProfile && currentUser) {
                        setProfileUser({
                            username: currentUser.username,
                            image: currentUser.image
                        });
                    } else {
                        setProfileUser({
                            username: username,
                            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                        });
                    }
                }

                // 2. If it's the own profile, fetch liked posts
                if (isOwnProfile && currentUser) {
                    const localLikedIds: string[] = JSON.parse(
                        localStorage.getItem(`liked_posts_${currentUser.uuid}`) || "[]"
                    );

                    if (localLikedIds.length > 0) {
                        // Fetch all posts to filter the ones we liked
                        const allResponse = await fetch("http://localhost:3000/post/getAll");
                        if (allResponse.ok) {
                            const allPosts: PostData[] = await allResponse.json();
                            const filteredLiked = allPosts.filter(p => localLikedIds.includes(p.uuid));
                            setLikedPosts(filteredLiked);
                        }
                    } else {
                        setLikedPosts([]);
                    }
                }
            } catch (err) {
                console.error(err);
                // Fallback for visual rendering if user has 0 posts and endpoint didn't throw
                if (isOwnProfile && currentUser) {
                    setProfileUser({
                        username: currentUser.username,
                        image: currentUser.image
                    });
                } else {
                    setProfileUser({
                        username: username,
                        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [username, isOwnProfile]);

    const getSortedPosts = (list: PostData[]) => {
        const sorted = [...list];
        if (sortBy === "newest") {
            sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (sortBy === "oldest") {
            sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (sortBy === "likes") {
            sorted.sort((a, b) => b.likes - a.likes);
        }
        return sorted;
    };

    const currentFeedList = activeTab === "posts" ? userPosts : likedPosts;
    const sortedFeedList = getSortedPosts(currentFeedList);

    if (isLoading) {
        return (
            <>
                <Header />
                <main className={styles.container}>
                    <div className={styles.loadingWrapper}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>Carregando perfil digital...</p>
                    </div>
                </main>
            </>
        );
    }

    if (userNotFound) {
        return (
            <>
                <Header />
                <main className={styles.container}>
                    <div className={styles.notFoundWrapper}>
                        <h1 className={styles.notFoundTitle}>404</h1>
                        <p className={styles.notFoundText}>Usuário "{username}" não existe na Matrix.</p>
                        <button className={styles.backBtn} onClick={() => navigate("/")}>
                            Voltar para a Home
                        </button>
                    </div>
                </main>
            </>
        );
    }

    const coverBackground = getCyberpunkGradient(username || "default");
    const avatarSrc = profileUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    return (
        <>
            <Header />
            <main className={styles.container}>
                <div className={styles.profileWrapper}>
                    {/* Cover Section */}
                    <div className={styles.cover} style={{ background: coverBackground }}>
                        <div className={styles.coverOverlay}></div>
                    </div>

                    {/* Profile details container */}
                    <div className={styles.headerInfo}>
                        <div className={styles.avatarWrapper}>
                            <img 
                                src={avatarSrc} 
                                alt={username} 
                                className={styles.avatar} 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
                                }}
                            />
                            <div className={styles.meta}>
                                <h1 className={styles.username}>@{profileUser?.username || username}</h1>
                                <p className={styles.role}>Membro do BlogU</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation tabs & filter bar */}
                    <div className={styles.controlBar}>
                        <div className={styles.tabs}>
                            <button 
                                className={`${styles.tabBtn} ${activeTab === "posts" ? styles.activeTab : ""}`}
                                onClick={() => setActiveTab("posts")}
                            >
                                {isOwnProfile ? "Minhas Publicações" : "Publicações"}
                                <span className={styles.countBadge}>{userPosts.length}</span>
                            </button>
                            {isOwnProfile && (
                                <button 
                                    className={`${styles.tabBtn} ${activeTab === "likes" ? styles.activeTab : ""}`}
                                    onClick={() => setActiveTab("likes")}
                                >
                                    Curtidos
                                    <span className={styles.countBadge}>{likedPosts.length}</span>
                                </button>
                            )}
                        </div>

                        <div className={styles.filterGroup}>
                            <label htmlFor="sort-select" className={styles.filterLabel}>Ordenar por</label>
                            <select 
                                id="sort-select"
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="newest">Mais novos</option>
                                <option value="oldest">Mais antigos</option>
                                <option value="likes">Mais curtidos</option>
                            </select>
                        </div>
                    </div>

                    {/* Posts Feed Grid */}
                    {sortedFeedList.length > 0 ? (
                        <div className={styles.feedGrid}>
                            {sortedFeedList.map((post) => (
                                <PostCard key={post.uuid} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyText}>
                                {activeTab === "posts" 
                                    ? (isOwnProfile ? "Você ainda não publicou nenhuma ideia." : "Este usuário ainda não publicou nada.") 
                                    : "Você ainda não curtiu nenhum post."}
                            </p>
                            {isOwnProfile && activeTab === "posts" && (
                                <p className={styles.emptySubtext}>Clique em "+ Novo Post" no topo para começar!</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
