import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@/hooks/use-kv'
import { 
  ChartBar,
  TrendUp,
  Clock,
  Database,
  GitBranch,
  Globe,
  Eye,
  Download
} from '@phosphor-icons/react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

interface AnalyticsData {
  sourcesByType: Array<{ name: string; value: number; color: string }>
  sourcesByMonth: Array<{ month: string; github: number; websites: number; docs: number }>
  topDomains: Array<{ domain: string; count: number; relevance: number }>
  analysisMetrics: Array<{ metric: string; value: number; change: number }>
  qualityDistribution: Array<{ range: string; count: number }>
}

export function AnalyticsView() {
  const [analyticsData, setAnalyticsData] = useKV<AnalyticsData>('analytics-data', {
    sourcesByType: [],
    sourcesByMonth: [],
    topDomains: [],
    analysisMetrics: [],
    qualityDistribution: []
  })
  
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Generate demo analytics data
  const generateAnalyticsData = (): AnalyticsData => {
    return {
      sourcesByType: [
        { name: 'GitHub Repos', value: 89, color: '#8b5cf6' },
        { name: 'Documentation', value: 45, color: '#10b981' },
        { name: 'Websites', value: 32, color: '#3b82f6' },
        { name: 'Tutorials', value: 23, color: '#f59e0b' }
      ],
      sourcesByMonth: [
        { month: 'Jan', github: 12, websites: 8, docs: 5 },
        { month: 'Feb', github: 19, websites: 12, docs: 7 },
        { month: 'Mar', github: 15, websites: 9, docs: 11 },
        { month: 'Apr', github: 22, websites: 15, docs: 8 },
        { month: 'May', github: 28, websites: 18, docs: 14 },
        { month: 'Jun', github: 31, websites: 22, docs: 16 }
      ],
      topDomains: [
        { domain: 'github.com', count: 89, relevance: 95 },
        { domain: 'spark.apache.org', count: 23, relevance: 98 },
        { domain: 'databricks.com', count: 15, relevance: 92 },
        { domain: 'stackoverflow.com', count: 12, relevance: 78 },
        { domain: 'medium.com', count: 8, relevance: 65 }
      ],
      analysisMetrics: [
        { metric: 'Avg Processing Time', value: 2.3, change: -12 },
        { metric: 'Success Rate', value: 94.2, change: 5 },
        { metric: 'Relevance Score', value: 87.6, change: 8 },
        { metric: 'Daily Sources', value: 12.5, change: 15 }
      ],
      qualityDistribution: [
        { range: '90-100%', count: 45 },
        { range: '80-89%', count: 67 },
        { range: '70-79%', count: 32 },
        { range: '60-69%', count: 18 },
        { range: 'Below 60%', count: 7 }
      ]
    }
  }

  // Load analytics data
  useEffect(() => {
    if (analyticsData.sourcesByType.length === 0) {
      const demoData = generateAnalyticsData()
      setAnalyticsData(demoData)
    }
  }, [])

  const refreshAnalytics = async () => {
    setIsLoading(true)
    
    // Simulate analytics computation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newData = generateAnalyticsData()
    setAnalyticsData(newData)
    setIsLoading(false)
  }

  const MetricCard = ({ title, value, change, icon: Icon }: {
    title: string
    value: string | number
    change: number
    icon: any
  }) => (
    <Card className="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${
          change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
        }`}>
          <TrendUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(change)}% from last month
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Insights and metrics for your source collection
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshAnalytics} disabled={isLoading}>
            {isLoading ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TrendUp className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.analysisMetrics.map((metric, index) => (
          <MetricCard
            key={metric.metric}
            title={metric.metric}
            value={metric.metric.includes('Rate') || metric.metric.includes('Score') 
              ? `${metric.value}%` 
              : metric.metric.includes('Time')
              ? `${metric.value}s`
              : metric.value
            }
            change={metric.change}
            icon={[Database, TrendUp, Eye, Clock][index]}
          />
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Source Analysis</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sources by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Sources by Type</CardTitle>
                <CardDescription>Distribution of source types in your collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.sourcesByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.sourcesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {analyticsData.sourcesByType.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Domains */}
            <Card>
              <CardHeader>
                <CardTitle>Top Source Domains</CardTitle>
                <CardDescription>Most frequently referenced domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topDomains.map((domain, index) => (
                    <div key={domain.domain} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{domain.domain}</p>
                          <p className="text-xs text-muted-foreground">
                            {domain.count} sources
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          {domain.relevance}%
                        </div>
                        <div className="text-xs text-muted-foreground">relevance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Source Analysis Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Collection Trends</CardTitle>
              <CardDescription>Monthly breakdown of source additions by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.sourcesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="github" stackId="a" fill="#8b5cf6" name="GitHub" />
                    <Bar dataKey="docs" stackId="a" fill="#10b981" name="Documentation" />
                    <Bar dataKey="websites" stackId="a" fill="#3b82f6" name="Websites" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Quality Distribution</CardTitle>
              <CardDescription>Distribution of sources by relevance score ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.qualityDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="range" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection Growth Trend</CardTitle>
              <CardDescription>Cumulative source additions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.sourcesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="github" 
                      stackId="1" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="docs" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="websites" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}