import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { Toast } from '../Toast/Toast';

export function Login() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.URL_API}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Email ou senha incorretos");
            }

            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "Erro ao conectar com o servidor.";
            setErrorMsg(msg);
            setToast({ message: msg, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsSubmitting(true);

        try {
            let imageStr = "";
            if (profilePic) {
                imageStr = await fileToBase64(profilePic);
            } else {
                imageStr = `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerUsername}`;
            }

            const response = await fetch(`${process.env.URL_API}/users/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: registerUsername,
                    email: registerEmail,
                    password: registerPassword,
                    image: imageStr
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Falha ao realizar cadastro");
            }

            setToast({ message: "Cadastro realizado com sucesso! Faça login para continuar.", type: "success" });
            setLoginEmail(registerEmail);
            setLoginPassword("");
            setActiveTab("login");
            
            setRegisterUsername("");
            setRegisterEmail("");
            setRegisterPassword("");
            setProfilePic(null);
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "Erro ao cadastrar.";
            setErrorMsg(msg);
            setToast({ message: msg, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePic(e.target.files[0]);
        }
    };

    return (
        <div className={styles.authContainer}>
            {/* CARD DE LOGIN */}
            <div 
                className={`${styles.authCard} ${activeTab === 'login' ? styles.maximized : styles.minimized}`}
                onClick={() => activeTab === 'register' && setActiveTab('login')}
            >
                {/* Conteúdo Minimizado */}
                <div className={styles.minimizedContent}>
                    <span className={styles.verticalTitle}>ENTRAR</span>
                    <div className={styles.minimizedIcon}>🔑</div>
                </div>

                {/* Conteúdo do Formulário */}
                <form className={styles.formContent} onSubmit={handleLoginSubmit}>
                    <div className={styles.titleContainer}>
                        <h2 className={styles.titleText}>Entrar</h2>
                    </div>
                    
                    <div className={styles.formBody}>
                        {errorMsg && activeTab === 'login' && <div className={styles.errorMsg}>{errorMsg}</div>}
                        <div className={styles.inputGroup}>
                            <label htmlFor="login-email" className={styles.label}>E-mail</label>
                            <input 
                                id="login-email"
                                type="email" 
                                className={styles.input}
                                placeholder="Digite seu e-mail" 
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                disabled={activeTab !== 'login' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="login-password" className={styles.label}>Senha</label>
                            <input 
                                id="login-password"
                                type="password" 
                                className={styles.input}
                                placeholder="Digite sua senha" 
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                disabled={activeTab !== 'login' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.primaryBtn} 
                                disabled={activeTab !== 'login' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isSubmitting ? "Entrando..." : "Entrar"}
                            </button>
                            <button 
                                type="button" 
                                className={styles.secondaryBtn} 
                                disabled={activeTab !== 'login' || isSubmitting}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('register');
                                }}
                            >
                                Criar Conta
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* CARD DE CADASTRO */}
            <div 
                className={`${styles.authCard} ${activeTab === 'register' ? styles.maximized : styles.minimized}`}
                onClick={() => activeTab === 'login' && setActiveTab('register')}
            >
                {/* Conteúdo Minimizado */}
                <div className={styles.minimizedContent}>
                    <span className={styles.verticalTitle}>CADASTRAR</span>
                    <div className={styles.minimizedIcon}>📝</div>
                </div>

                {/* Conteúdo do Formulário */}
                <form className={styles.formContent} onSubmit={handleRegisterSubmit}>
                    <div className={styles.titleContainer}>
                        <h2 className={styles.titleText}>Cadastrar</h2>
                    </div>
                    
                    <div className={styles.formBody}>
                        {errorMsg && activeTab === 'register' && <div className={styles.errorMsg}>{errorMsg}</div>}
                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-username" className={styles.label}>Nome de Usuário</label>
                            <input 
                                id="reg-username"
                                type="text" 
                                className={styles.input}
                                placeholder="Escolha seu usuário" 
                                value={registerUsername}
                                onChange={(e) => setRegisterUsername(e.target.value)}
                                required
                                disabled={activeTab !== 'register' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-email" className={styles.label}>E-mail</label>
                            <input 
                                id="reg-email"
                                type="email" 
                                className={styles.input}
                                placeholder="Digite seu e-mail" 
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                required
                                disabled={activeTab !== 'register' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-password" className={styles.label}>Senha</label>
                            <input 
                                id="reg-password"
                                type="password" 
                                className={styles.input}
                                placeholder="Crie uma senha" 
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                required
                                disabled={activeTab !== 'register' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-profile" className={styles.label}>Foto de Perfil (Opcional)</label>
                            <div className={styles.fileInputContainer} onClick={(e) => e.stopPropagation()}>
                                <input 
                                    id="reg-profile"
                                    type="file" 
                                    accept="image/*"
                                    className={styles.fileInput}
                                    onChange={handleFileChange}
                                    disabled={activeTab !== 'register' || isSubmitting}
                                />
                                <span className={styles.fileInputLabel}>
                                    {profilePic ? profilePic.name : 'Selecionar imagem...'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.primaryBtn} 
                                disabled={activeTab !== 'register' || isSubmitting}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                            </button>
                            <button 
                                type="button" 
                                className={styles.secondaryBtn} 
                                disabled={activeTab !== 'register' || isSubmitting}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('login');
                                }}
                            >
                                Já tenho conta
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
}