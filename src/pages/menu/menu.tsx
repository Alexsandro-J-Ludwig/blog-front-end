import { Header } from "../../components/Header/Header";
import { PostList } from "../../components/PostList/PostList";

export function Main() {
    return (
        <> 
            <Header />
            <main style={{ minHeight: "calc(100vh - 70px)", background: "radial-gradient(circle at 50% 50%, #1e1e1e 0%, #121212 100%)" }}>
                <PostList />
            </main>
        </>
    );
}