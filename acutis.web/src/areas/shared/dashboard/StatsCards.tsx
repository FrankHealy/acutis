type StatsCardsProps = {
  unitName: string;
};

const UnitStatsMap: Record<string, { occupancy: string; color: string; admissionsToday: number; activeResidents: number }> =
  {
    Alcohol: { occupancy: "32/40", color: "bg-blue-500", admissionsToday: 3, activeResidents: 32 },
    Detox: { occupancy: "8/12", color: "bg-red-500", admissionsToday: 1, activeResidents: 8 },
    Drugs: { occupancy: "18/25", color: "bg-orange-500", admissionsToday: 2, activeResidents: 18 },
    Ladies: { occupancy: "15/25", color: "bg-pink-500", admissionsToday: 1, activeResidents: 15 },
  };

const StatsCards = ({ unitName }: StatsCardsProps) => {
  const stats = UnitStatsMap[unitName] ?? {
    occupancy: "0/0",
    color: "bg-slate-500",
    admissionsToday: 0,
    activeResidents: 0,
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="app-card rounded-xl p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--app-text-muted)]">{unitName} Unit Occupancy</p>
            <p className="text-2xl font-bold text-[var(--app-text)]">{stats.occupancy}</p>
          </div>
          <div className={`h-3 w-3 rounded-full ${stats.color}`} />
        </div>
      </div>
      <div className="app-card rounded-xl p-4 transition-shadow hover:shadow-md">
        <p className="text-sm font-medium text-[var(--app-text-muted)]">Admissions Today</p>
        <p className="text-2xl font-bold text-[var(--app-text)]">{stats.admissionsToday}</p>
      </div>
      <div className="app-card rounded-xl p-4 transition-shadow hover:shadow-md">
        <p className="text-sm font-medium text-[var(--app-text-muted)]">Active Residents</p>
        <p className="text-2xl font-bold text-[var(--app-text)]">{stats.activeResidents}</p>
      </div>
    </div>
  );
};

export default StatsCards;
