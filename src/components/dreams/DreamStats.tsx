'use client';

import { motion } from 'framer-motion';
import { ResponsivePie } from '@nivo/pie';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles } from 'lucide-react';

interface TopItem {
  name: string;
  count: number;
}

interface DreamStatsProps {
  totalDreams: number;
  topSymbols: TopItem[];
  topThemes: TopItem[];
  topEmotions: TopItem[];
  onNewDream: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-900/90 p-4 rounded-xl border border-purple-400/30 backdrop-blur-md shadow-xl"
      >
        <p className="text-purple-100 font-medium text-lg">{label}</p>
        <p className="text-purple-200 font-bold text-xl">{`${payload[0].value} occurrences`}</p>
        <p className="text-purple-300/90 text-sm mt-1">{`Type: ${payload[0].dataKey}`}</p>
      </motion.div>
    );
  }
  return null;
};

const COLORS = [
  '#F0ABFC', // fuchsia-300
  '#E879F9', // fuchsia-400
  '#D946EF', // fuchsia-500
  '#C026D3', // fuchsia-600
  '#A21CAF', // fuchsia-700
];

const THEME_COLORS = [
  '#F0ABFC', // fuchsia-300
  '#E879F9', // fuchsia-400
];

export function DreamStats({ totalDreams, topSymbols, topThemes, topEmotions, onNewDream }: DreamStatsProps) {
  // Ensure we have data to display
  const pieData = topEmotions?.length > 0 
    ? topEmotions.map(emotion => ({
        id: emotion.name,
        label: emotion.name,
        value: emotion.count,
      }))
    : [{ id: 'No Data', label: 'No Emotions Recorded', value: 1 }];

  // Prepare combined data for bar chart with fallback
  const combinedData = topSymbols?.length > 0 || topThemes?.length > 0
    ? Array.from(new Set([...topSymbols, ...topThemes].map(item => item.name)))
        .map(name => {
          const symbol = topSymbols.find(s => s.name === name);
          const theme = topThemes.find(t => t.name === name);
          return {
            name,
            symbols: symbol?.count || 0,
            themes: theme?.count || 0
          };
        })
        .sort((a, b) => (b.symbols + b.themes) - (a.symbols + a.themes))
        .slice(0, 7)
    : [{ name: 'No Data', symbols: 0, themes: 0 }];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-12 gap-8">
        {/* Charts Section - Left Side */}
        <div className="col-span-12 md:col-span-9 grid grid-cols-12 gap-8">
          {/* Emotional Distribution - Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-5 h-[420px] relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-purple-500/20 to-indigo-500/20 border border-fuchsia-500/20 backdrop-blur-md shadow-lg"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
            <h3 className="relative text-lg font-semibold text-fuchsia-100 mb-4">
              Emotional Landscape
            </h3>
            <ResponsivePie
              data={pieData}
              margin={{ top: 10, right: 80, bottom: 100, left: 80 }}
              innerRadius={0.6}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              colors={COLORS}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLinkLabels={true}
              arcLinkLabel={d => `${d.id} (${d.value})`}
              arcLinkLabelsSkipAngle={7}
              arcLinkLabelsTextColor="#f0abfc"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#ffffff"
              arcLinkLabelsOffset={1}
              arcLinkLabelsDiagonalLength={16}
              arcLinkLabelsStraightLength={16}
              motionConfig="gentle"
              transitionMode="pushIn"
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 60,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemsSpacing: 2,
                  symbolSize: 10,
                  itemTextColor: '#f0abfc',
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#f5d0fe'
                      }
                    }
                  ]
                }
              ]}
            />
          </motion.div>

          {/* Combined Themes and Symbols - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-7 h-[420px] relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-purple-500/20 to-indigo-500/20 border border-fuchsia-500/20 backdrop-blur-md shadow-lg"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
            <h3 className="relative text-lg font-semibold text-fuchsia-100 mb-4">
              Dream Elements
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={combinedData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
              >
                <XAxis 
                  type="number" 
                  stroke="#f0abfc"
                  tickCount={5}
                  domain={[0, 'auto']}
                  tick={{ fill: '#f0abfc' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#f0abfc"
                  tick={{ fill: '#f0abfc' }}
                  width={135}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240, 171, 252, 0.1)' }} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span style={{ color: '#f0abfc' }}>{value}</span>}
                />
                <Bar 
                  dataKey="symbols" 
                  name="Symbols" 
                  fill={THEME_COLORS[0]} 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={20} 
                  stackId="stack"
                />
                <Bar 
                  dataKey="themes" 
                  name="Themes" 
                  fill={THEME_COLORS[1]} 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={20} 
                  stackId="stack"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Action Cards - Right Side */}
        <div className="col-span-12 md:col-span-3 flex items-center">
          {/* Combined Stats and Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-purple-500/20 to-indigo-500/20 border border-fuchsia-500/20 backdrop-blur-md shadow-lg w-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse delay-700"></div>
            <div className="relative space-y-2.5">
              {/* Total Dreams Section */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/20">
                  <Sparkles className="w-5 h-5 text-fuchsia-300" />
                </div>
                <div>
                  <h3 className="text-fuchsia-100 text-base font-medium">Total Dreams</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-fuchsia-300 to-indigo-300 text-transparent bg-clip-text">
                    {totalDreams}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-fuchsia-500/10"></div>

              {/* Record Dream Section */}
              <div className="flex items-center justify-between">
                <h3 className="text-fuchsia-100 text-base font-medium">Record Dream</h3>
                <button 
                  onClick={onNewDream}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 border border-fuchsia-500/20 text-fuchsia-200 hover:text-fuchsia-100 hover:border-fuchsia-400/30 transition-colors"
                >
                  New Dream
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 