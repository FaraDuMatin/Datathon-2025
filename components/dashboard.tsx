'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import { useMemo } from 'react';

interface DashboardProps {
  lawId: number;
  data: Array<{ company_name: string; score: number }>;
}

export function Dashboard({ lawId, data }: DashboardProps) {
  // Compute statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const scores = data.map((d) => d.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const positive = scores.filter((s) => s > 0).length;
    const negative = scores.filter((s) => s < 0).length;

    return {
      average: avg,
      median,
      positive,
      negative,
      min: Math.min(...scores),
      max: Math.max(...scores),
    };
  }, [data]);

  // Distribution data (bins)
  const distributionData = useMemo(() => {
    if (!data) return [];
    const bins = 20;
    const binSize = 2 / bins; // range is -1 to 1
    const counts = Array(bins).fill(0);

    data.forEach((d) => {
      const binIndex = Math.min(Math.floor((d.score + 1) / binSize), bins - 1);
      counts[binIndex]++;
    });

    return counts.map((count, i) => ({
      range: `${(-1 + i * binSize).toFixed(2)}`,
      count,
    }));
  }, [data]);

  // Top 10 most impacted (absolute value)
  const topImpacted = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
      .slice(0, 10)
      .map((d) => ({
        name: d.company_name.length > 20 ? d.company_name.slice(0, 20) + '...' : d.company_name,
        score: d.score,
      }));
  }, [data]);

  // Scatter plot data (first 100 companies for readability)
  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.slice(0, 100).map((d, i) => ({
      index: i,
      score: d.score,
      company: d.company_name,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Law {lawId} Impact Analysis</h2>
        <p className="text-muted-foreground">Analysis of {data.length} S&P 500 companies</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-2xl">{stats?.average.toFixed(3)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Median Score</CardDescription>
            <CardTitle className="text-2xl">{stats?.median.toFixed(3)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Positive Impact</CardDescription>
            <CardTitle className="text-2xl">{stats?.positive}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Negative Impact</CardDescription>
            <CardTitle className="text-2xl">{stats?.negative}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Histogram of impact scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution (First 100)</CardTitle>
            <CardDescription>Scatter plot of company scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" name="Company Index" />
                <YAxis dataKey="score" name="Score" domain={[-1, 1]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-sm">{payload[0].payload.company}</p>
                          <p className="text-xs text-primary">Score: {payload[0].payload.score.toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cumulative Score Line */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Impact Trend</CardTitle>
            <CardDescription>Sorted scores (low to high)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[...data]
                  .sort((a, b) => a.score - b.score)
                  .map((d, i) => ({ index: i, score: d.score, company: d.company_name}))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis domain={[-1, 1]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-sm">{payload[0].payload.company}</p>
                          <p className="text-xs text-muted-foreground">Index: {payload[0].payload.index}</p>
                          <p className="text-xs text-primary">Score: {payload[0].value?.toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
