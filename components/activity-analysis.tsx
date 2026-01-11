"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react"
import { getClient } from "@/lib/supabase/client"

interface ActivityAnalysisProps {
  athleteId: string | undefined
  hrZones: any
}

export function ActivityAnalysis({ athleteId, hrZones }: ActivityAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const [pmcData, setPmcData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [zoneDistribution, setZoneDistribution] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    currentCTL: 0,
    currentATL: 0,
    currentTSB: 0,
    rampRate: 0,
    totalTSS: 0,
    avgTSS: 0,
    peakTSS: 0,
    totalHours: 0,
  })

  useEffect(() => {
    if (athleteId) {
      loadAnalysisData()
    }
  }, [athleteId, period])

  const loadAnalysisData = async () => {
    setLoading(true)
    const supabase = getClient()
    const days = Number.parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      const { data: dailyMetrics } = await supabase
        .from("daily_metrics")
        .select("*")
        .eq("athlete_id", athleteId)
        .gte("metric_date", startDate.toISOString().split("T")[0])
        .order("metric_date", { ascending: true })

      if (dailyMetrics && dailyMetrics.length > 0) {
        setPmcData(
          dailyMetrics.map((d) => ({
            date: new Date(d.metric_date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }),
            ctl: d.ctl || 0,
            atl: d.atl || 0,
            tsb: d.tsb || 0,
            tss: d.tss_total || 0,
          })),
        )

        const latest = dailyMetrics[dailyMetrics.length - 1]
        const totalTSS = dailyMetrics.reduce((sum, d) => sum + (d.tss_total || 0), 0)
        const activeDays = dailyMetrics.filter((d) => d.tss_total > 0).length

        setMetrics({
          currentCTL: latest.ctl || 0,
          currentATL: latest.atl || 0,
          currentTSB: latest.tsb || 0,
          rampRate: latest.ramp_rate || 0,
          totalTSS: totalTSS,
          avgTSS: activeDays > 0 ? Math.round(totalTSS / activeDays) : 0,
          peakTSS: Math.max(...dailyMetrics.map((d) => d.tss_total || 0)),
          totalHours: dailyMetrics.reduce((sum, d) => sum + (d.total_duration_minutes || 0), 0) / 60,
        })
      }

      const { data: activities } = await supabase
        .from("training_activities")
        .select("*")
        .eq("athlete_id", athleteId)
        .gte("activity_date", startDate.toISOString())
        .order("activity_date", { ascending: true })

      if (activities && activities.length > 0) {
        const weeklyGroups: { [key: string]: any } = {}
        activities.forEach((a) => {
          const date = new Date(a.activity_date)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          const weekKey = weekStart.toISOString().split("T")[0]

          if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = {
              week: `W${Math.ceil(date.getDate() / 7)}`,
              tss: 0,
              duration: 0,
              distance: 0,
              activities: 0,
            }
          }
          weeklyGroups[weekKey].tss += a.tss || 0
          weeklyGroups[weekKey].duration += a.duration_minutes || 0
          weeklyGroups[weekKey].distance += a.distance_km || 0
          weeklyGroups[weekKey].activities += 1
        })
        setWeeklyData(Object.values(weeklyGroups))

        if (hrZones) {
          setZoneDistribution([
            { zone: "Z1 Recovery", percent: 15, color: "#6b7280" },
            { zone: "Z2 Endurance", percent: 35, color: "#22c55e" },
            { zone: "Z3 Tempo", percent: 25, color: "#eab308" },
            { zone: "Z4 Threshold", percent: 18, color: "#f97316" },
            { zone: "Z5 VO2max", percent: 7, color: "#ef4444" },
          ])
        }
      }
    } catch (error) {
      console.error("Error loading analysis data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTSBStatus = (tsb: number) => {
    if (tsb > 25) return { label: "Fresh", color: "bg-green-500" }
    if (tsb > 5) return { label: "Recovered", color: "bg-emerald-500" }
    if (tsb > -10) return { label: "Optimal", color: "bg-blue-500" }
    if (tsb > -25) return { label: "Tired", color: "bg-yellow-500" }
    return { label: "Fatigued", color: "bg-red-500" }
  }

  const tsbStatus = getTSBStatus(metrics.currentTSB)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Analysis</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fitness (CTL)</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentCTL.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Chronic Training Load</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatigue (ATL)</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentATL.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Acute Training Load</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form (TSB)</CardTitle>
            <Badge className={tsbStatus.color}>{tsbStatus.label}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.currentTSB.toFixed(1)}
              {metrics.currentTSB > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Training Stress Balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ramp Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rampRate.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">CTL points/week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Management Chart (PMC)</CardTitle>
          <CardDescription>Track fitness, fatigue, and form over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pmcData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="tss" fill="hsl(var(--muted))" opacity={0.3} name="TSS" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ctl"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="CTL (Fitness)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="atl"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  name="ATL (Fatigue)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="tsb"
                  fill="#22c55e"
                  stroke="#22c55e"
                  fillOpacity={0.2}
                  name="TSB (Form)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Training Load</CardTitle>
            <CardDescription>TSS distribution by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="tss" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Weekly TSS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time in HR Zones</CardTitle>
            <CardDescription>Distribution across training zones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {zoneDistribution.map((zone, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{zone.zone}</span>
                    <span className="font-medium">{zone.percent}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${zone.percent}%`, backgroundColor: zone.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
          <CardDescription>Totals for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{metrics.totalTSS}</div>
              <div className="text-sm text-muted-foreground">Total TSS</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{metrics.avgTSS}</div>
              <div className="text-sm text-muted-foreground">Avg TSS/Day</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{metrics.peakTSS}</div>
              <div className="text-sm text-muted-foreground">Peak TSS</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{metrics.totalHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
