import { useEffect } from 'react';
import googleOneTap from 'google-one-tap';
import { signIn } from 'next-auth/react';

export function useOneTapLogin() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && clientId.trim()) {
      googleOneTap({
        client_id: clientId,
        callback: async (response) => {
          await signIn('google-one-tap', { credential: response.credential, redirect: false });
        },
      });
    } else {
      console.warn('Google One Tap skipped: NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured or empty');
    }
  }, []);
}