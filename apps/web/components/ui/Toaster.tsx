'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    padding: '12px 16px',
                },
                success: {
                    iconTheme: {
                        primary: '#16a34a',
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#dc2626',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}
