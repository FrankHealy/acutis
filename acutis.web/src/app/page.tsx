import AuthGate from './modules/auth/components/AuthGate';
import StartupLanding from './units/shared/StartupLanding';

export default function Home() {
  return (
    <AuthGate>
      <StartupLanding />
    </AuthGate>
  );
}
