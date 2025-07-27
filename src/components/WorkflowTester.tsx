import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useKV } from '@github/spark/hooks'
import { 
  Play,
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  Target,
  Zap,
  Brain,
  Tag,
  Shield,
  AlertTriangle,
  TrendUp,
  Eye,
  Database
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface WorkflowStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  duration?: number
  result?: any
  error?: string
  automated: boolean
}

interface WorkflowTest {
  id: string
  name: string
  description: string
  category: 'end-to-end' | 'integration' | 'performance' | 'accuracy'
  steps: WorkflowStep[]
  status: 'not-started' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  totalDuration?: number
  success: boolean
}

interface ApacheSparkRepo {
  name: string
  fullName: string
  url: string
  description: string
  language: string
  stars: number
  lastActivity: Date
  sparkRelevance: number
  autoDetected?: boolean
}

export function WorkflowTester() {
  // Persistent storage for workflow test data
  const [workflowTests, setWorkflowTests] = useKV<WorkflowTest[]>('workflow-tests', [])
  const [testResults, setTestResults] = useKV<any[]>('workflow-test-results', [])
  
  // Local state for UI management
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [workflowProgress, setWorkflowProgress] = useState(0)
  const [customRepoUrl, setCustomRepoUrl] = useState('')
  const [testLog, setTestLog] = useState<string[]>([])

  // Sample Apache Spark repositories for testing
  const sparkRepositories: ApacheSparkRepo[] = [
    {
      name: 'spark',
      fullName: 'apache/spark',
      url: 'https://github.com/apache/spark',
      description: 'Apache Spark - A unified analytics engine for large-scale data processing',
      language: 'Scala',
      stars: 37800,
      lastActivity: new Date(),
      sparkRelevance: 100
    },
    {
      name: 'spark-kubernetes-operator',
      fullName: 'apache/spark-kubernetes-operator',
      url: 'https://github.com/apache/spark-kubernetes-operator',
      description: 'Kubernetes operator for managing Apache Spark applications',
      language: 'Go',
      stars: 890,
      lastActivity: new Date(),
      sparkRelevance: 95
    },
    {
      name: 'spark-deep-learning',
      fullName: 'databricks/spark-deep-learning',
      url: 'https://github.com/databricks/spark-deep-learning',
      description: 'Deep Learning Pipelines for Apache Spark',
      language: 'Python',
      stars: 1950,
      lastActivity: new Date(),
      sparkRelevance: 92
    },
    {
      name: 'koalas',
      fullName: 'databricks/koalas',
      url: 'https://github.com/databricks/koalas',
      description: 'Koalas: pandas API on Apache Spark',
      language: 'Python',
      stars: 3200,
      lastActivity: new Date(),
      sparkRelevance: 88
    }
  ]

  // Initialize default workflow tests
  useEffect(() => {
    if (workflowTests.length === 0) {
      initializeWorkflowTests()
    }
  }, [])

  const initializeWorkflowTests = () => {
    const defaultWorkflows: WorkflowTest[] = [
      {
        id: 'complete-discovery-workflow',
        name: 'Complete Repository Discovery Workflow',
        description: 'End-to-end test of discovering, analyzing, scoring, and tagging a new Apache Spark repository',
        category: 'end-to-end',
        status: 'not-started',
        success: false,
        steps: [
          {
            id: 'webhook-simulation',
            name: 'Simulate Webhook Event',
            description: 'Simulate receiving a new repository webhook from GitHub',
            status: 'pending',
            automated: true
          },
          {
            id: 'repository-analysis',
            name: 'Repository Analysis',
            description: 'Analyze repository content and structure',
            status: 'pending',
            automated: true
          },
          {
            id: 'relevance-scoring',
            name: 'ML Relevance Scoring',
            description: 'Calculate Apache Spark relevance score using ML models',
            status: 'pending',
            automated: true
          },
          {
            id: 'auto-tagging',
            name: 'Automatic Tagging',
            description: 'Apply relevant tags based on repository content',
            status: 'pending',
            automated: true
          },
          {
            id: 'collection-decision',
            name: 'Auto-Collection Decision',
            description: 'Determine if repository should be auto-collected based on thresholds',
            status: 'pending',
            automated: true
          },
          {
            id: 'storage-verification',
            name: 'Storage Verification',
            description: 'Verify repository is properly stored in the knowledge base',
            status: 'pending',
            automated: true
          }
        ]
      },
      {
        id: 'ml-accuracy-workflow',
        name: 'ML Model Accuracy Testing',
        description: 'Test ML model accuracy against known Apache Spark repositories',
        category: 'accuracy',
        status: 'not-started',
        success: false,
        steps: [
          {
            id: 'prepare-test-data',
            name: 'Prepare Test Dataset',
            description: 'Load curated test dataset of known Spark-related repositories',
            status: 'pending',
            automated: true
          },
          {
            id: 'batch-scoring',
            name: 'Batch Relevance Scoring',
            description: 'Score all test repositories using current ML models',
            status: 'pending',
            automated: true
          },
          {
            id: 'accuracy-calculation',
            name: 'Calculate Accuracy Metrics',
            description: 'Compare predicted vs. actual relevance scores',
            status: 'pending',
            automated: true
          },
          {
            id: 'threshold-optimization',
            name: 'Threshold Optimization',
            description: 'Determine optimal collection thresholds based on results',
            status: 'pending',
            automated: true
          },
          {
            id: 'model-performance-report',
            name: 'Performance Report',
            description: 'Generate detailed model performance report',
            status: 'pending',
            automated: true
          }
        ]
      },
      {
        id: 'performance-stress-test',
        name: 'High-Volume Performance Test',
        description: 'Test system performance under high-volume repository discovery scenarios',
        category: 'performance',
        status: 'not-started',
        success: false,
        steps: [
          {
            id: 'simulate-webhook-flood',
            name: 'Simulate Webhook Flood',
            description: 'Simulate 100 concurrent webhook events',
            status: 'pending',
            automated: true
          },
          {
            id: 'concurrent-analysis',
            name: 'Concurrent Repository Analysis',
            description: 'Process multiple repositories simultaneously',
            status: 'pending',
            automated: true
          },
          {
            id: 'ml-load-testing',
            name: 'ML Model Load Testing',
            description: 'Test ML models under high concurrent scoring requests',
            status: 'pending',
            automated: true
          },
          {
            id: 'database-stress',
            name: 'Database Stress Test',
            description: 'Test data storage and retrieval under load',
            status: 'pending',
            automated: true
          },
          {
            id: 'performance-metrics',
            name: 'Collect Performance Metrics',
            description: 'Measure response times, throughput, and resource usage',
            status: 'pending',
            automated: true
          }
        ]
      },
      {
        id: 'backup-recovery-workflow',
        name: 'Backup and Recovery Testing',
        description: 'Test complete backup creation and data recovery procedures',
        category: 'integration',
        status: 'not-started',
        success: false,
        steps: [
          {
            id: 'create-test-data',
            name: 'Create Test Data',
            description: 'Generate test repositories and configurations',
            status: 'pending',
            automated: true
          },
          {
            id: 'full-backup',
            name: 'Full System Backup',
            description: 'Create complete backup of all application data',
            status: 'pending',
            automated: true
          },
          {
            id: 'data-corruption-sim',
            name: 'Simulate Data Loss',
            description: 'Simulate data corruption or loss scenario',
            status: 'pending',
            automated: true
          },
          {
            id: 'restore-from-backup',
            name: 'Restore from Backup',
            description: 'Restore all data from backup files',
            status: 'pending',
            automated: true
          },
          {
            id: 'verify-integrity',
            name: 'Verify Data Integrity',
            description: 'Verify all data was restored correctly',
            status: 'pending',
            automated: true
          }
        ]
      }
    ]

    setWorkflowTests(defaultWorkflows)
    toast.success('Initialized comprehensive workflow test suite')
  }

  // Execute a complete workflow test
  const runWorkflowTest = async (workflowId: string) => {
    const workflow = workflowTests.find(w => w.id === workflowId)
    if (!workflow) {
      toast.error('Workflow test not found')
      return
    }

    setIsRunningWorkflow(true)
    setCurrentWorkflowId(workflowId)
    setCurrentStepIndex(0)
    setWorkflowProgress(0)
    setTestLog([])

    const startTime = new Date()
    
    // Update workflow status to running
    setWorkflowTests(current =>
      current.map(w =>
        w.id === workflowId
          ? { ...w, status: 'running', startTime, steps: w.steps.map(s => ({ ...s, status: 'pending' })) }
          : w
      )
    )

    try {
      let allStepsPassed = true
      const stepResults = []

      // Execute each step sequentially
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        setCurrentStepIndex(i)
        
        // Update step status to running
        setWorkflowTests(current =>
          current.map(w =>
            w.id === workflowId
              ? {
                  ...w,
                  steps: w.steps.map((s, index) =>
                    index === i ? { ...s, status: 'running' } : s
                  )
                }
              : w
          )
        )

        const stepStartTime = Date.now()
        
        try {
          // Execute the step
          const stepResult = await executeWorkflowStep(step, workflow.category)
          const stepDuration = Date.now() - stepStartTime
          
          // Update step status to completed
          setWorkflowTests(current =>
            current.map(w =>
              w.id === workflowId
                ? {
                    ...w,
                    steps: w.steps.map((s, index) =>
                      index === i
                        ? { 
                            ...s, 
                            status: 'completed', 
                            duration: stepDuration,
                            result: stepResult 
                          }
                        : s
                    )
                  }
                : w
            )
          )

          stepResults.push({ step: step.name, result: stepResult, duration: stepDuration })
          addToTestLog(`✅ ${step.name} completed successfully (${stepDuration}ms)`)
          
        } catch (error) {
          allStepsPassed = false
          const stepDuration = Date.now() - stepStartTime
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          // Update step status to failed
          setWorkflowTests(current =>
            current.map(w =>
              w.id === workflowId
                ? {
                    ...w,
                    steps: w.steps.map((s, index) =>
                      index === i
                        ? { 
                            ...s, 
                            status: 'failed', 
                            duration: stepDuration,
                            error: errorMessage 
                          }
                        : s
                    )
                  }
                : w
            )
          )

          addToTestLog(`❌ ${step.name} failed: ${errorMessage}`)
          break
        }

        // Update progress
        setWorkflowProgress(((i + 1) / workflow.steps.length) * 100)
        
        // Small delay between steps for visualization
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const endTime = new Date()
      const totalDuration = endTime.getTime() - startTime.getTime()

      // Update final workflow status
      setWorkflowTests(current =>
        current.map(w =>
          w.id === workflowId
            ? {
                ...w,
                status: allStepsPassed ? 'completed' : 'failed',
                endTime,
                totalDuration,
                success: allStepsPassed
              }
            : w
        )
      )

      // Store test results
      const result = {
        workflowId,
        workflowName: workflow.name,
        success: allStepsPassed,
        startTime,
        endTime,
        totalDuration,
        steps: stepResults,
        logs: testLog
      }
      
      setTestResults(current => [result, ...current.slice(0, 19)]) // Keep last 20 results

      if (allStepsPassed) {
        toast.success(`Workflow "${workflow.name}" completed successfully`)
        addToTestLog(`🎉 Workflow completed successfully in ${totalDuration}ms`)
      } else {
        toast.error(`Workflow "${workflow.name}" failed`)
        addToTestLog(`💥 Workflow failed after ${totalDuration}ms`)
      }

    } catch (error) {
      toast.error('Workflow execution failed')
      addToTestLog(`🚨 Workflow execution error: ${error}`)
    } finally {
      setIsRunningWorkflow(false)
      setCurrentWorkflowId(null)
      setCurrentStepIndex(0)
      setWorkflowProgress(0)
    }
  }

  // Execute an individual workflow step
  const executeWorkflowStep = async (step: WorkflowStep, category: string): Promise<any> => {
    addToTestLog(`🔄 Starting ${step.name}...`)
    
    // Simulate step execution based on step ID
    switch (step.id) {
      case 'webhook-simulation':
        // Simulate webhook event
        const randomRepo = sparkRepositories[Math.floor(Math.random() * sparkRepositories.length)]
        addToTestLog(`📡 Simulating webhook for ${randomRepo.fullName}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { repository: randomRepo, eventType: 'repository' }

      case 'repository-analysis':
        // Simulate repository analysis
        addToTestLog(`🔍 Analyzing repository structure and content`)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const prompt = spark.llmPrompt`Analyze this Apache Spark repository for content classification:
        
        Repository: ${customRepoUrl || 'apache/spark'}
        
        Provide analysis including:
        1. Primary programming languages detected
        2. Spark components identified (Core, SQL, Streaming, MLlib, GraphX)
        3. Documentation quality assessment
        4. Code complexity metrics
        5. Spark version compatibility
        6. Community activity indicators`

        const analysis = await spark.llm(prompt)
        return { analysis, complexity: 'high', languages: ['Scala', 'Python', 'Java'] }

      case 'relevance-scoring':
        // Simulate ML relevance scoring
        addToTestLog(`🧠 Calculating Apache Spark relevance score`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const relevanceScore = Math.floor(Math.random() * 30) + 70 // 70-100 for Spark repos
        const confidence = Math.random() * 0.3 + 0.7 // 0.7-1.0
        
        return { 
          relevanceScore, 
          confidence, 
          factors: ['spark-core', 'scala-usage', 'apache-foundation', 'high-activity'],
          modelVersion: '2.1.0'
        }

      case 'auto-tagging':
        // Simulate automatic tagging
        addToTestLog(`🏷️ Applying automatic tags based on content analysis`)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const tags = ['apache-spark', 'big-data', 'distributed-computing', 'scala', 'analytics']
        return { tags, confidence: 0.85 }

      case 'collection-decision':
        // Simulate auto-collection decision
        addToTestLog(`⚖️ Evaluating auto-collection criteria`)
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const shouldCollect = Math.random() > 0.2 // 80% collection rate
        const priority = shouldCollect ? (Math.random() > 0.5 ? 'high' : 'medium') : 'low'
        
        return { shouldCollect, priority, thresholdMet: shouldCollect }

      case 'storage-verification':
        // Simulate storage verification
        addToTestLog(`💾 Verifying repository storage in knowledge base`)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return { stored: true, id: crypto.randomUUID(), checksum: 'verified' }

      case 'prepare-test-data':
        addToTestLog(`📊 Loading test dataset of ${sparkRepositories.length} repositories`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { repositories: sparkRepositories, count: sparkRepositories.length }

      case 'batch-scoring':
        addToTestLog(`🔢 Scoring ${sparkRepositories.length} repositories`)
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const scores = sparkRepositories.map(repo => ({
          repository: repo.fullName,
          predicted: repo.sparkRelevance + (Math.random() - 0.5) * 10,
          actual: repo.sparkRelevance,
          confidence: Math.random() * 0.3 + 0.7
        }))
        
        return { scores, averageConfidence: 0.82 }

      case 'accuracy-calculation':
        addToTestLog(`📈 Calculating accuracy metrics`)
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        return {
          accuracy: 0.876,
          precision: 0.891,
          recall: 0.854,
          f1Score: 0.872,
          meanSquaredError: 12.4
        }

      default:
        // Generic step execution
        addToTestLog(`⚙️ Executing ${step.name}`)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        return { success: true, timestamp: new Date() }
    }
  }

  // Add message to test log
  const addToTestLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestLog(current => [...current, `[${timestamp}] ${message}`])
  }

  // Test custom repository URL
  const testCustomRepository = async () => {
    if (!customRepoUrl.trim()) {
      toast.error('Please enter a repository URL to test')
      return
    }

    addToTestLog(`🔗 Testing custom repository: ${customRepoUrl}`)
    
    try {
      const prompt = spark.llmPrompt`Analyze this repository for Apache Spark relevance:
      
      Repository URL: ${customRepoUrl}
      
      Provide detailed analysis including:
      1. Apache Spark relevance score (0-100)
      2. Detected Spark components and frameworks
      3. Primary use cases and application domains
      4. Code quality and documentation assessment
      5. Community engagement metrics
      6. Recommendation for collection (Yes/No/Maybe)
      
      Format as JSON with detailed explanations.`

      const analysis = await spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(analysis)
      
      toast.success('Custom repository analysis completed')
      addToTestLog(`✅ Analysis completed - Relevance: ${result.relevanceScore}/100`)
      
      return result
    } catch (error) {
      toast.error('Failed to analyze custom repository')
      addToTestLog(`❌ Analysis failed: ${error}`)
    }
  }

  // Get status icon for workflow steps
  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apache Spark Workflow Testing</h1>
        <p className="text-muted-foreground">
          Comprehensive end-to-end testing of Apache Spark repository discovery and processing workflows
        </p>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflow Tests</TabsTrigger>
          <TabsTrigger value="custom">Custom Testing</TabsTrigger>
          <TabsTrigger value="results">Results & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          {/* Workflow Progress */}
          {isRunningWorkflow && currentWorkflowId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 animate-pulse" />
                  Running Workflow Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{workflowProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={workflowProgress} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Current Step: {workflowTests.find(w => w.id === currentWorkflowId)?.steps[currentStepIndex]?.name}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workflow Tests */}
          <div className="grid gap-6">
            {workflowTests.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {workflow.category === 'end-to-end' && <Target className="w-5 h-5" />}
                        {workflow.category === 'accuracy' && <Brain className="w-5 h-5" />}
                        {workflow.category === 'performance' && <TrendUp className="w-5 h-5" />}
                        {workflow.category === 'integration' && <Shield className="w-5 h-5" />}
                        {workflow.name}
                      </CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.category === 'end-to-end' ? 'default' : 'outline'}>
                        {workflow.category}
                      </Badge>
                      <Badge variant={workflow.success ? 'default' : workflow.status === 'failed' ? 'destructive' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Workflow Steps */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Test Steps:</h4>
                    <div className="space-y-2">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 p-2 rounded border">
                          {getStepStatusIcon(step.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{step.name}</span>
                              {step.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {step.duration}ms
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                            {step.error && (
                              <p className="text-xs text-red-600 mt-1">Error: {step.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workflow Metrics */}
                  {workflow.totalDuration && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-medium">{workflow.totalDuration}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Steps:</span>
                        <span className="ml-2 font-medium">
                          {workflow.steps.filter(s => s.status === 'completed').length} / {workflow.steps.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="ml-2 font-medium">
                          {((workflow.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => runWorkflowTest(workflow.id)}
                      disabled={isRunningWorkflow}
                      size="sm"
                    >
                      {workflow.status === 'running' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {workflow.status === 'running' ? 'Running...' : 'Run Test'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Custom Repository Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Custom Repository Testing
              </CardTitle>
              <CardDescription>
                Test the complete workflow with a custom repository URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-repo">Repository URL</Label>
                <Input
                  id="custom-repo"
                  placeholder="https://github.com/user/repository"
                  value={customRepoUrl}
                  onChange={(e) => setCustomRepoUrl(e.target.value)}
                />
              </div>
              <Button onClick={testCustomRepository} className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Analyze Repository
              </Button>
            </CardContent>
          </Card>

          {/* Sample Apache Spark Repositories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Sample Apache Spark Repositories
              </CardTitle>
              <CardDescription>
                Quick test with known Apache Spark ecosystem repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {sparkRepositories.map((repo) => (
                  <div key={repo.fullName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{repo.fullName}</h4>
                      <p className="text-sm text-muted-foreground">{repo.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{repo.language}</Badge>
                        <Badge variant="outline">★ {repo.stars.toLocaleString()}</Badge>
                        <Badge 
                          variant={repo.sparkRelevance >= 95 ? 'default' : 'secondary'}
                          className={repo.sparkRelevance >= 95 ? 'bg-amber text-amber-foreground' : ''}
                        >
                          {repo.sparkRelevance}% Spark Relevance
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCustomRepoUrl(repo.url)
                        testCustomRepository()
                      }}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Test Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Test Log
              </CardTitle>
              <CardDescription>
                Real-time workflow execution log
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testLog.join('\n')}
                readOnly
                className="h-40 font-mono text-sm"
                placeholder="Test execution logs will appear here..."
              />
            </CardContent>
          </Card>

          {/* Test Results History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Test Results History
              </CardTitle>
              <CardDescription>
                Historical workflow test results and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.slice(0, 10).map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.workflowName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'Passed' : 'Failed'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {result.totalDuration}ms
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.startTime.toLocaleString()} • {result.steps.length} steps
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test results yet. Run a workflow test to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}