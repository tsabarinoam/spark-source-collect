import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@/hooks/use-kv'
import { 
  Database,
  GitBranch,
  Globe,
  TrendUp,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  Webhook,
  Activity,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SourceStats {
  totalSources: number
  githubRepos: number
  websites: number
  analyzed: number
  pending: number
  lastUpdated: Date
  webhookEvents?: number
  autoProcessed?: number
}

interface RecentSource {
  id: string
  url: string
  title: string
  type: 'github' | 'website' | 'documentation'
  status: 'analyzing' | 'completed' | 'failed'
  addedAt: Date
  relevanceScore?: number
  source?: 'manual' | 'webhook'
}

interface WebhookConfig {
  id: string
  name: string
  isActive: boolean
  totalTriggers: number
}

interface WebhookEvent {
  id: string
  repository: {
    isSparkRelated: boolean
  }
  timestamp: Date
}

export function Dashboard() {
  const [stats, setStats] = useKV<SourceStats>('dashboard-stats', {
    totalSources: 0,
    githubRepos: 0,
    websites: 0,
    analyzed: 0,
    pending: 0,
    lastUpdated: new Date(),
    webhookEvents: 0,
    autoProcessed: 0
  })
  
  const [recentSources, setRecentSources] = useKV<RecentSource[]>('recent-sources', [])
  const [webhooks] = useKV<WebhookConfig[]>('github-webhooks', [])
  const [webhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [isInitializing, setIsInitializing] = useState(false)

  // Update stats when webhook data changes
  useEffect(() => {
    const totalWebhookEvents = webhookEvents.length
    const sparkRelatedEvents = webhookEvents.filter(event => event.repository.isSparkRelated).length
    
    setStats(current => ({
      ...current,
      webhookEvents: totalWebhookEvents,
      autoProcessed: sparkRelatedEvents
    }))
  }, [webhookEvents])

  // Initialize demo data for the platform
  const initializeDemoData = async () => {
    setIsInitializing(true)
    
    try {
      // Simulate Apache Spark repository analysis
      const prompt = spark.llmPrompt`Analyze the Apache Spark GitHub repository structure and identify key components that would be valuable for a source intelligence platform. Focus on documentation, examples, and core modules.`
      const analysis = await spark.llm(prompt)
      
      // Update stats with demo data
      const demoStats: SourceStats = {
        totalSources: 156,
        githubRepos: 89,
        websites: 45,
        analyzed: 134,
        pending: 22,
        lastUpdated: new Date(),
        webhookEvents: 28,
        autoProcessed: 12
      }
      
      // Create sample recent sources
      const demoSources: RecentSource[] = [
        {
          id: 'spark-main',
          url: 'https://github.com/apache/spark',
          title: 'Apache Spark - Unified Analytics Engine',
          type: 'github',
          status: 'completed',
          addedAt: new Date(Date.now() - 3600000),
          relevanceScore: 98,
          source: 'manual'
        },
        {
          id: 'spark-docs',
          url: 'https://spark.apache.org/docs/latest/',
          title: 'Spark Documentation - Latest',
          type: 'documentation',
          status: 'completed',
          addedAt: new Date(Date.now() - 7200000),
          relevanceScore: 95,
          source: 'manual'
        },
        {
          id: 'databricks-guide',
          url: 'https://docs.databricks.com/spark/',
          title: 'Databricks Spark Guide',
          type: 'documentation',
          status: 'analyzing',
          addedAt: new Date(Date.now() - 1800000),
          source: 'manual'
        },
        {
          id: 'spark-examples',
          url: 'https://github.com/apache/spark/tree/master/examples',
          title: 'Spark Examples Repository',
          type: 'github',
          status: 'completed',
          addedAt: new Date(Date.now() - 5400000),
          relevanceScore: 87,
          source: 'manual'
        },
        {
          id: 'auto-spark-ml',
          url: 'https://github.com/community/spark-ml-advanced',
          title: 'Advanced Spark ML Pipeline',
          type: 'github',
          status: 'completed',
          addedAt: new Date(Date.now() - 900000),
          relevanceScore: 92,
          source: 'webhook'
        }
      ]
      
      setStats(demoStats)
      setRecentSources(demoSources)
      
      toast.success('Platform initialized with Apache Spark sources')
    } catch (error) {
      toast.error('Failed to initialize demo data')
    } finally {
      setIsInitializing(false)
    }
  }

  const getStatusIcon = (status: RecentSource['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'analyzing':
        return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
      case 'failed':
        return <div className="w-4 h-4 rounded-full bg-red-500" />
    }
  }

  const getTypeIcon = (type: RecentSource['type']) => {
    switch (type) {
      case 'github':
        return <GitBranch className="w-4 h-4" />
      case 'website':
        return <Globe className="w-4 h-4" />
      case 'documentation':
        return <Database className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Source Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze your Spark knowledge collection
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={initializeDemoData} disabled={isInitializing}>
            {isInitializing ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Initialize Demo Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GitHub Repos</CardTitle>
            <GitBranch className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.githubRepos}</div>
            <p className="text-xs text-muted-foreground">
              Repository sources
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Complete</CardTitle>
            <TrendUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.analyzed}</div>
            <Progress 
              value={(stats.analyzed / stats.totalSources) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Analysis</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              In processing queue
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Events</CardTitle>
            <Webhook className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.webhookEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Processed</CardTitle>
            <Lightning className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.autoProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Spark repositories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Status & Recent Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhook Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhook Status
            </CardTitle>
            <CardDescription>
              Real-time GitHub monitoring status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhooks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No webhooks configured</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Setup Webhooks
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.slice(0, 3).map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{webhook.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {webhook.totalTriggers} events received
                      </p>
                    </div>
                    <Badge 
                      variant={webhook.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                
                {webhooks.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{webhooks.length - 3} more webhooks
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sources */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Sources</CardTitle>
                <CardDescription>
                  Latest additions to your knowledge collection
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sources yet. Initialize demo data to get started.</p>
                </div>
              ) : (
                recentSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(source.type)}
                        {getStatusIcon(source.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{source.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {source.type}
                          </Badge>
                          {source.source === 'webhook' && (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              <Activity className="w-3 h-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{source.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {source.relevanceScore && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">
                            {source.relevanceScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">relevance</div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {new Date(source.addedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(source.addedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}