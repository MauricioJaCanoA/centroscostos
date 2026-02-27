export const isTokenValid = () => {
    const token = sessionStorage.getItem('token');
    const expireIn = sessionStorage.getItem('expire_in');

    if (!token || !expireIn) {
        return false;
    }

    const now = new Date().getTime();
    let expireTime = parseInt(expireIn);
    
    // Si expireIn no es un número válido (NaN), el token no es válido
    if (isNaN(expireTime)) {
        return false;
    }

    // Si el timestamp está en segundos (menos de 13 dígitos, normalmente 10), convertir a milisegundos
    if (expireTime < 1000000000000) {
        expireTime *= 1000;
    }
    
    const expireDate = new Date(expireTime).getTime();

    return now < expireDate;
}