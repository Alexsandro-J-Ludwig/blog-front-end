export function loginVerify(): boolean {
    const token = localStorage.getItem("token");

    if (!token) {
        return false;
    }

    try {
        const base64url = token.split('.')[1];
        
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, '/');

        const jsonPayload = decodeURIComponent(
            window.atob(base64)
            .split('')
            .map(c => "%" + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const dadosToken = JSON.parse(jsonPayload);

        if (!dadosToken || !dadosToken.exp) {
            return false;
        }

        const tempoReal = Math.floor(Date.now() / 1000);
        const tempoAssinatura = dadosToken.exp;

        return tempoAssinatura > tempoReal;
    } catch (err: any) {
        return false;
    }
}

export function getCurrentUser(): { id: string; uuid: string; username: string; image?: string } | null {
    if (!loginVerify()) {
        return null;
    }
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const base64url = token.split('.')[1];
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
            .split('')
            .map(c => "%" + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (err: any) {
        return null;
    }
}