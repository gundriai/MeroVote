const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export enum TributeType {
    CANDLE = 'candle',
    PRAYER = 'prayer',
}

export const tributesService = {
    async getStats() {
        const response = await fetch(`${API_URL}/tributes/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        return response.json();
    },

    async addTribute(type: TributeType) {
        const response = await fetch(`${API_URL}/tributes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type }),
        });
        if (!response.ok) {
            throw new Error('Failed to add tribute');
        }
        return response.json();
    },
};
