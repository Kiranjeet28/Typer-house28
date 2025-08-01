export function generateJoinCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function getRoomExpiration(): Date {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // Room expires in 24 hours
    return expirationTime;
}