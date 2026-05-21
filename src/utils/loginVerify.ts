export interface UserTokenPayload {
    id: string;
    uuid: string;
    username: string;
    image: string;
    exp: number;
    iat: number;
}

export function getUserFromToken(): UserTokenPayload | null {
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

        const dadosToken = JSON.parse(jsonPayload) as UserTokenPayload;
        if (!dadosToken || !dadosToken.exp) return null;

        const tempoReal = Math.floor(Date.now() / 1000);
        if (dadosToken.exp > tempoReal) {
            const userId = dadosToken.uuid || dadosToken.id;
            const overrides = localStorage.getItem(`user_override_${userId}`);
            if (overrides) {
                try {
                    const parsedOverrides = JSON.parse(overrides);
                    if (parsedOverrides.username) dadosToken.username = parsedOverrides.username;
                    if (parsedOverrides.image) dadosToken.image = parsedOverrides.image;
                } catch (e) {
                    console.error("Error applying token overrides:", e);
                }
            }
            return dadosToken;
        }
        return null;
    } catch (err) {
        return null;
    }
}

export function loginVerify(): boolean {
    return getUserFromToken() !== null;
}