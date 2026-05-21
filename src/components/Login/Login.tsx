import { useState } from 'react';
import styles from './Login.module.css';

export function Login() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Login submetido com sucesso! (E-mail: ${loginEmail})`);
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Cadastro realizado com sucesso! (Usuário: ${registerUsername}, E-mail: ${registerEmail})`);
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
                                disabled={activeTab !== 'login'}
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
                                disabled={activeTab !== 'login'}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.primaryBtn} 
                                disabled={activeTab !== 'login'}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Entrar
                            </button>
                            <button 
                                type="button" 
                                className={styles.secondaryBtn} 
                                disabled={activeTab !== 'login'}
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
                                disabled={activeTab !== 'register'}
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
                                disabled={activeTab !== 'register'}
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
                                disabled={activeTab !== 'register'}
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
                                    disabled={activeTab !== 'register'}
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
                                disabled={activeTab !== 'register'}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Cadastrar
                            </button>
                            <button 
                                type="button" 
                                className={styles.secondaryBtn} 
                                disabled={activeTab !== 'register'}
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
        </div>
    );
}