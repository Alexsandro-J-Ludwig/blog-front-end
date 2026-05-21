import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export function Login() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao realizar login. Verifique suas credenciais.');
            }

            localStorage.setItem('token', data.token);
            setStatus({ type: 'success', text: 'Login realizado com sucesso! Redirecionando...' });

            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err: any) {
            setStatus({ type: 'error', text: err.message || 'Erro ao realizar login' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            let base64Image = '';
            if (profilePic) {
                base64Image = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(profilePic);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
            }

            const response = await fetch('http://localhost:3000/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: registerUsername,
                    email: registerEmail,
                    password: registerPassword,
                    image: base64Image || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao realizar cadastro.');
            }

            setStatus({ type: 'success', text: 'Cadastro realizado com sucesso! Redirecionando para login...' });

            // Clear register fields
            setRegisterUsername('');
            setRegisterEmail('');
            setRegisterPassword('');
            setProfilePic(null);

            // Switch to login tab and prefill email
            setLoginEmail(registerEmail);
            setTimeout(() => {
                setActiveTab('login');
                setStatus(null);
            }, 2000);
        } catch (err: any) {
            setStatus({ type: 'error', text: err.message || 'Erro ao realizar cadastro' });
        } finally {
            setLoading(false);
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
                        {status && activeTab === 'login' && (
                            <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.success : styles.error}`}>
                                {status.type === 'success' ? '✅' : '❌'} {status.text}
                            </div>
                        )}

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
                                disabled={activeTab !== 'login' || loading}
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
                                disabled={activeTab !== 'login' || loading}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={styles.primaryBtn}
                                disabled={activeTab !== 'login' || loading}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                disabled={activeTab !== 'login' || loading}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('register');
                                    setStatus(null);
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
                        {status && activeTab === 'register' && (
                            <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.success : styles.error}`}>
                                {status.type === 'success' ? '✅' : '❌'} {status.text}
                            </div>
                        )}

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
                                disabled={activeTab !== 'register' || loading}
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
                                disabled={activeTab !== 'register' || loading}
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
                                disabled={activeTab !== 'register' || loading}
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
                                    disabled={activeTab !== 'register' || loading}
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
                                disabled={activeTab !== 'register' || loading}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                            <button
                                type="button"
                                className={styles.secondaryBtn}
                                disabled={activeTab !== 'register' || loading}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('login');
                                    setStatus(null);
                                }}
                            >
                                Já tenho conta
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}