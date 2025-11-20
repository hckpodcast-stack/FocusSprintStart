import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Dot } from 'recharts';

interface WeeklyData {
  day: string;
  value: number;
  satisfaction: number;
}

interface WeightedMomentumChartProps {
  weeklyData: WeeklyData[];
}

export function WeightedMomentumChart({ weeklyData }: WeightedMomentumChartProps) {
  // Calculate stats
  const daysShownUp = weeklyData.filter(d => d.value > 0).length;
  const avgSatisfaction = weeklyData.reduce((sum, d) => sum + (d.value > 0 ? d.satisfaction : 0), 0) / Math.max(daysShownUp, 1);

  // Custom dot component with size and opacity based on satisfaction
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || payload.value === 0) return null;
    
    // Map satisfaction (1-10) to dot size (4-12) and opacity (0.4-1)
    const size = 4 + (payload.satisfaction / 10) * 8;
    const opacity = 0.4 + (payload.satisfaction / 10) * 0.6;
    
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={size}
        fill="#7DD3C0"
        opacity={opacity}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  // Calculate line color based on average satisfaction
  const getLineColor = () => {
    if (avgSatisfaction >= 7) return '#2E3F4F'; // Deep blue for high satisfaction
    if (avgSatisfaction >= 4) return '#4A5C6A'; // Medium blue-gray
    return '#9CA3AF'; // Gray for low satisfaction
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E8E6E1] rounded-3xl p-6 space-y-4"
    >
      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-[#2E3F4F]">Weighted Momentum Line</h3>
        <p className="text-xs text-[#9CA3AF]">
          Your weekly focus pattern
        </p>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{ 
                value: 'Focus Sessions', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6B7280', fontSize: 11 }
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getLineColor()}
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Text */}
      <div className="bg-[#F5F3EF] rounded-2xl p-4">
        <p className="text-sm text-[#4A5C6A]">
          You showed up <span className="text-[#2E3F4F]">{daysShownUp} of 7 days</span> this week, 
          with an average satisfaction of <span className="text-[#2E3F4F]">{avgSatisfaction.toFixed(1)}</span> — 
          {avgSatisfaction >= 7 ? ' strong, intentional progress.' : 
           avgSatisfaction >= 4 ? ' steady, meaningful work.' : 
           ' room for deeper engagement.'}
        </p>
      </div>
    </motion.div>
  );
}
