import ScreeningLanding from '@/areas/screening/ScreeningLanding';

export default function ScreeningUnitPage() {
  const userRole = "Reception";
  const isReception = userRole.toLowerCase() === "reception";

  return <ScreeningLanding showOnlyCalls={isReception} />;
}
