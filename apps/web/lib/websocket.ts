import type { WSMessage, LeaderboardEntry } from './types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;

class WebSocketManager {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private messageHandlers: Map<string, MessageHandler[]> = new Map();
    private onConnectHandlers: ConnectionHandler[] = [];
    private onDisconnectHandlers: ConnectionHandler[] = [];

    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`${WS_URL}?token=${token}`);

                this.ws.onopen = () => {
                    this.reconnectAttempts = 0;
                    this.onConnectHandlers.forEach(handler => handler());
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        const type = data.type || 'message';
                        const handlers = this.messageHandlers.get(type) || [];
                        handlers.forEach(handler => handler(data));
                    } catch {
                        console.error('Failed to parse WebSocket message');
                    }
                };

                this.ws.onclose = () => {
                    this.onDisconnectHandlers.forEach(handler => handler());
                    this.attemptReconnect(token);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private attemptReconnect(token: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.connect(token).catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    send(message: WSMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    joinContest(contestId: string) {
        this.send({ type: 'join_contest', contestId });
    }

    leaveContest(contestId: string) {
        this.send({ type: 'leave_contest', contestId });
    }

    submitAnswer(contestId: string, questionId: string, answer: 'A' | 'B' | 'C' | 'D') {
        this.send({ type: 'submit_answer', contestId, questionId, answer });
    }

    onMessage(type: string, handler: MessageHandler) {
        const handlers = this.messageHandlers.get(type) || [];
        handlers.push(handler);
        this.messageHandlers.set(type, handlers);

        return () => {
            const idx = handlers.indexOf(handler);
            if (idx > -1) handlers.splice(idx, 1);
        };
    }

    onConnect(handler: ConnectionHandler) {
        this.onConnectHandlers.push(handler);
        return () => {
            const idx = this.onConnectHandlers.indexOf(handler);
            if (idx > -1) this.onConnectHandlers.splice(idx, 1);
        };
    }

    onDisconnect(handler: ConnectionHandler) {
        this.onDisconnectHandlers.push(handler);
        return () => {
            const idx = this.onDisconnectHandlers.indexOf(handler);
            if (idx > -1) this.onDisconnectHandlers.splice(idx, 1);
        };
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

export const wsManager = new WebSocketManager();

// Re-export types for convenience
export type { LeaderboardEntry };
