import type { WSMessage, LeaderboardEntry } from './types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;



let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 1000;
const messageHandlers: Map<string, MessageHandler[]> = new Map();
const connectHandlers: ConnectionHandler[] = [];
const disconnectHandlers: ConnectionHandler[] = [];



function attemptReconnect(token: string) {
    if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(() => {
            connect(token).catch(console.error);
        }, reconnectDelay * reconnectAttempts);
    }
}



 function connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            ws = new WebSocket(`${WS_URL}?token=${token}`);

            ws.onopen = () => {
                reconnectAttempts = 0;
                connectHandlers.forEach(handler => handler());
                resolve();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const type = data.type || 'message';
                    const handlers = messageHandlers.get(type) || [];
                    handlers.forEach(handler => handler(data));
                } catch {
                    console.error('Failed to parse WebSocket message');
                }
            };

            ws.onclose = () => {
                disconnectHandlers.forEach(handler => handler());
                attemptReconnect(token);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

function disconnect() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

function send(message: WSMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

function joinContest(contestId: string) {
    send({ type: 'join_contest', contestId });
}

function leaveContest(contestId: string) {
    send({ type: 'leave_contest', contestId });
}

function submitAnswer(contestId: string, questionId: string, answer: 'A' | 'B' | 'C' | 'D') {
    send({ type: 'submit_answer', contestId, questionId, answer });
}

function onMessage(type: string, handler: MessageHandler) {
    const handlers = messageHandlers.get(type) || [];
    handlers.push(handler);
    messageHandlers.set(type, handlers);

    return () => {
        const idx = handlers.indexOf(handler);
        if (idx > -1) handlers.splice(idx, 1);
    };
}

function onConnect(handler: ConnectionHandler) {
    connectHandlers.push(handler);
    return () => {
        const idx = connectHandlers.indexOf(handler);
        if (idx > -1) connectHandlers.splice(idx, 1);
    };
}

function onDisconnect(handler: ConnectionHandler) {
    disconnectHandlers.push(handler);
    return () => {
        const idx = disconnectHandlers.indexOf(handler);
        if (idx > -1) disconnectHandlers.splice(idx, 1);
    };
}

function isConnected(): boolean {
    return ws !== null && ws.readyState === WebSocket.OPEN;
}



export const wsManager = {
    connect,
    disconnect,
    send,
    joinContest,
    leaveContest,
    submitAnswer,
    onMessage,
    onConnect,
    onDisconnect,
    isConnected,
};

// Re-export types for convenience
export type { LeaderboardEntry };
