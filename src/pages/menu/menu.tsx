import { Header } from "../../components/Header/Header";
import { WelcomeSection } from "../../components/WelcomeSection/WelcomeSection";
import { PostList } from "../../components/PostList/PostList";
import styles from "./menu.module.css";

export function Main() {
    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.mainContent}>
                <WelcomeSection />
                <PostList />
            </main>
        </div>
    );
}
