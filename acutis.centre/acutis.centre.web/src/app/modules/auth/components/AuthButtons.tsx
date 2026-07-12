// /frontend-app/src/app/components/AuthButtons.tsx
'use client'; // Required as it uses client-side hooks

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading authentication status...</div>;
  }

  if (session) {
    return (
      <div style={{ padding: '10px', border: '1px solid green' }}>
        Signed in as **{session.user?.email}** <br />
        {/* Calls the NextAuth signout handler */}
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <div style={{ padding: '10px', border: '1px solid red' }}>
      Not signed in <br />
      {/* Calls the NextAuth signin handler, targeting the keycloak provider */}
      <button onClick={() => signIn('keycloak')}>Sign in with Keycloak</button>
    </div>
  );
}
