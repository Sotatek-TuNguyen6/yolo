'use client'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { CategoryStats } from '@/types/report'

interface OverviewProps {
  categoryStats?: CategoryStats;
}

export function Overview({ categoryStats }: OverviewProps = {}) {
  // Transform category stats into chart data
  const data = categoryStats 
    ? Object.entries(categoryStats).map(([name, stats]) => ({
        name,
        count: stats.count,
        averagePrice: stats.averagePrice,
        totalStock: stats.totalStock
      }))
    : [
        {
          name: 'No Data',
          count: 0,
          averagePrice: 0,
          totalStock: 0
        }
      ];

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='count'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}