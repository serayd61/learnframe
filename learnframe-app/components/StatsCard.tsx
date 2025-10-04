'use client';

interface StatsCardProps {
  icon: string;
  value: string;
  label: string;
  trend: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

export function StatsCard({ icon, value, label, trend, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg rounded-xl p-6 border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-sm text-green-400">{trend}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
