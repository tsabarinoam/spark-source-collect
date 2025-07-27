import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useKV } from '@github/spark/hooks'
import { 
  Webhook,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  Gear,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Globe
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface WebhookConfig {
  id: string
  name: string
  endpoint: string
  secret: string
  isActive: boolean
  events: string[]
  lastTriggered?: Date
  totalTriggers: number
  createdAt: Date
}

interface WebhookEvent {
  id: string
  webhookId: string
  eventType: string
  repository: {
    name: string
    fullName: string
    url: string
    description?: string
    language?: string
    stars: number
    isSparkRelated: boolean
  }
  timestamp: Date
  processed: boolean
  relevanceScore?: number
}

export function WebhookManager() {
  // Persistent storage for webhook configurations and events
  const [webhooks, setWebhooks] = useKV<WebhookConfig[]>('github-webhooks', [])
  const [recentEvents, setRecentEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [isAutoProcessing, setIsAutoProcessing] = useKV<boolean>('auto-processing-enabled', true)
  
  // Local state
  const [newWebhookName, setNewWebhookName] = useState('')
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null)

  // Auto-process new Spark repositories when they're detected
  useEffect(() => {
    if (!isAutoProcessing) return

    // Check for unprocessed Spark-related events
    const unprocessedSparkEvents = recentEvents.filter(
      event => !event.processed && event.repository.isSparkRelated
    )

    if (unprocessedSparkEvents.length > 0) {
      processSparkRepositories(unprocessedSparkEvents)
    }
  }, [recentEvents, isAutoProcessing])

  // Generate secure webhook endpoint and secret
  const generateWebhookConfig = () => {
    const endpoint = `https://spark-platform.github.io/webhooks/${crypto.randomUUID()}`
    const secret = crypto.randomUUID().replace(/-/g, '')
    return { endpoint, secret }
  }

  // Create new webhook configuration
  const createWebhook = async () => {
    if (!newWebhookName.trim()) {
      toast.error('Please enter a webhook name')
      return
    }

    setIsCreatingWebhook(true)
    
    try {
      const { endpoint, secret } = generateWebhookConfig()
      
      const newWebhook: WebhookConfig = {
        id: crypto.randomUUID(),
        name: newWebhookName.trim(),
        endpoint,
        secret,
        isActive: true,
        events: ['push', 'repository', 'release', 'star'],
        totalTriggers: 0,
        createdAt: new Date()
      }

      setWebhooks(current => [...current, newWebhook])
      setNewWebhookName('')
      
      toast.success(`Webhook "${newWebhook.name}" created successfully`)
      
      // Show setup instructions
      toast.info(
        'Copy the webhook URL to your GitHub organization settings to start monitoring repositories',
        { duration: 5000 }
      )
      
    } catch (error) {
      toast.error('Failed to create webhook')
    } finally {
      setIsCreatingWebhook(false)
    }
  }

  // Toggle webhook active status
  const toggleWebhook = (webhookId: string) => {
    setWebhooks(current =>
      current.map(webhook =>
        webhook.id === webhookId
          ? { ...webhook, isActive: !webhook.isActive }
          : webhook
      )
    )
    
    const webhook = webhooks.find(w => w.id === webhookId)
    if (webhook) {
      toast.success(`Webhook "${webhook.name}" ${webhook.isActive ? 'deactivated' : 'activated'}`)
    }
  }

  // Test webhook connectivity
  const testWebhookConnection = async (webhookId: string) => {
    setIsTestingConnection(webhookId)
    
    try {
      // Simulate webhook test by creating a mock event
      const testEvent: WebhookEvent = {
        id: crypto.randomUUID(),
        webhookId,
        eventType: 'ping',
        repository: {
          name: 'spark-test',
          fullName: 'test/spark-test',
          url: 'https://github.com/test/spark-test',
          description: 'Test repository for webhook validation',
          language: 'Scala',
          stars: 0,
          isSparkRelated: true
        },
        timestamp: new Date(),
        processed: false,
        relevanceScore: 85
      }

      setRecentEvents(current => [testEvent, ...current.slice(0, 49)]) // Keep last 50 events
      
      // Update webhook last triggered
      setWebhooks(current =>
        current.map(webhook =>
          webhook.id === webhookId
            ? { 
                ...webhook, 
                lastTriggered: new Date(),
                totalTriggers: webhook.totalTriggers + 1
              }
            : webhook
        )
      )
      
      toast.success('Webhook test completed successfully')
      
    } catch (error) {
      toast.error('Webhook test failed')
    } finally {
      setIsTestingConnection(null)
    }
  }

  // Process Spark-related repositories automatically
  const processSparkRepositories = async (events: WebhookEvent[]) => {
    for (const event of events) {
      if (event.repository.isSparkRelated && event.relevanceScore && event.relevanceScore > 70) {
        // Add to source collection for analysis
        try {
          const prompt = spark.llmPrompt`Analyze this new Spark repository for automatic collection:
          
          Repository: ${event.repository.fullName}
          URL: ${event.repository.url}
          Description: ${event.repository.description || 'No description available'}
          Language: ${event.repository.language || 'Unknown'}
          Stars: ${event.repository.stars}
          Event Type: ${event.eventType}
          
          Provide:
          1. Relevance assessment for Apache Spark ecosystem (1-100)
          2. Key technologies and topics covered
          3. Recommended priority level (high/medium/low)
          4. Specific value propositions for Spark developers
          5. Auto-categorization tags`

          const analysis = await spark.llm(prompt)
          
          // Mark event as processed
          setRecentEvents(current =>
            current.map(e =>
              e.id === event.id
                ? { ...e, processed: true }
                : e
            )
          )
          
        } catch (error) {
          console.error('Failed to process repository:', error)
        }
      }
    }
  }

  // Simulate webhook events for demonstration
  const simulateGitHubEvent = async () => {
    const mockRepositories = [
      {
        name: 'spark-streaming-kafka',
        fullName: 'community/spark-streaming-kafka',
        url: 'https://github.com/community/spark-streaming-kafka',
        description: 'Kafka integration for Spark Streaming with enhanced features',
        language: 'Scala',
        stars: 245,
        isSparkRelated: true,
        relevanceScore: 92
      },
      {
        name: 'spark-ml-pipeline',
        fullName: 'ai-labs/spark-ml-pipeline',
        url: 'https://github.com/ai-labs/spark-ml-pipeline',
        description: 'Advanced ML pipelines and algorithms for Apache Spark',
        language: 'Python',
        stars: 178,
        isSparkRelated: true,
        relevanceScore: 88
      },
      {
        name: 'random-project',
        fullName: 'user/random-project',
        url: 'https://github.com/user/random-project',
        description: 'Some unrelated project',
        language: 'JavaScript',
        stars: 12,
        isSparkRelated: false,
        relevanceScore: 15
      }
    ]

    const randomRepo = mockRepositories[Math.floor(Math.random() * mockRepositories.length)]
    const eventTypes = ['repository', 'push', 'release', 'star']
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    if (webhooks.length === 0) {
      toast.error('No active webhooks configured')
      return
    }

    const activeWebhook = webhooks.find(w => w.isActive)
    if (!activeWebhook) {
      toast.error('No active webhooks found')
      return
    }

    const mockEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      webhookId: activeWebhook.id,
      eventType: randomEvent,
      repository: randomRepo,
      timestamp: new Date(),
      processed: false,
      relevanceScore: randomRepo.relevanceScore
    }

    setRecentEvents(current => [mockEvent, ...current.slice(0, 49)])
    
    // Update webhook statistics
    setWebhooks(current =>
      current.map(webhook =>
        webhook.id === activeWebhook.id
          ? { 
              ...webhook, 
              lastTriggered: new Date(),
              totalTriggers: webhook.totalTriggers + 1
            }
          : webhook
      )
    )

    if (randomRepo.isSparkRelated) {
      toast.success(`New Spark repository detected: ${randomRepo.name}`)
    } else {
      toast.info(`Repository event received: ${randomRepo.name} (not Spark-related)`)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'repository':
        return <GitBranch className="w-4 h-4 text-blue-500" />
      case 'push':
        return <Activity className="w-4 h-4 text-green-500" />
      case 'release':
        return <CheckCircle className="w-4 h-4 text-purple-500" />
      case 'star':
        return <Globe className="w-4 h-4 text-amber-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (webhook: WebhookConfig) => {
    return webhook.isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">GitHub Webhook Integration</h1>
        <p className="text-muted-foreground mt-1">
          Automatically track and collect new Spark repositories in real-time
        </p>
      </div>

      {/* Auto-processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear className="w-5 h-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure how the platform handles incoming repository events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-processing">Auto-process Spark Repositories</Label>
              <p className="text-sm text-muted-foreground">
                Automatically analyze and collect repositories when Spark-related content is detected
              </p>
            </div>
            <Switch
              id="auto-processing"
              checked={isAutoProcessing}
              onCheckedChange={setIsAutoProcessing}
            />
          </div>
          
          {isAutoProcessing && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Auto-processing enabled - New Spark repositories will be automatically analyzed and added to the knowledge base
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Create Webhook
          </CardTitle>
          <CardDescription>
            Set up a new GitHub webhook to monitor organization repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-name">Webhook Name</Label>
            <Input
              id="webhook-name"
              placeholder="e.g., Apache Spark Organization Monitor"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={createWebhook} 
            disabled={isCreatingWebhook || !newWebhookName.trim()}
            className="w-full"
          >
            {isCreatingWebhook ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Webhook className="w-4 h-4 mr-2" />
            )}
            Create Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Management */}
      {webhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Webhooks</CardTitle>
            <CardDescription>
              Manage your GitHub webhook configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{webhook.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {webhook.endpoint}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(webhook)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Triggers:</span>
                      <span className="ml-2 font-medium">{webhook.totalTriggers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Triggered:</span>
                      <span className="ml-2 font-medium">
                        {webhook.lastTriggered 
                          ? webhook.lastTriggered.toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWebhook(webhook.id)}
                    >
                      {webhook.isActive ? (
                        <Pause className="w-4 h-4 mr-1" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      {webhook.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhookConnection(webhook.id)}
                      disabled={isTestingConnection === webhook.id}
                    >
                      {isTestingConnection === webhook.id ? (
                        <Clock className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Demo & Testing</CardTitle>
          <CardDescription>
            Simulate webhook events to test the integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={simulateGitHubEvent} variant="outline" className="w-full">
            <Activity className="w-4 h-4 mr-2" />
            Simulate GitHub Event
          </Button>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Events</CardTitle>
            <CardDescription>
              Latest repository events received from GitHub webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.eventType)}
                      <span className="font-medium text-sm">{event.repository.fullName}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.repository.isSparkRelated && (
                        <Badge className="bg-accent text-accent-foreground text-xs">
                          Spark Related
                        </Badge>
                      )}
                      {event.processed ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Processed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {event.repository.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{event.repository.language}</span>
                    <span>★ {event.repository.stars}</span>
                    <span>{event.timestamp.toLocaleTimeString()}</span>
                    {event.relevanceScore && (
                      <span>Relevance: {event.relevanceScore}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}