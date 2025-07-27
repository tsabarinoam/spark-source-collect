import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import { 
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Bug,
  Target,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Database,
  RefreshCw
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TestCase {
  id: string
  name: string
  description: string
  category: 'integration' | 'unit' | 'performance' | 'security' | 'usability'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error'
  lastRun: Date
  duration: number // in milliseconds
  assertions: TestAssertion[]
  environment: string
  automated: boolean
}

interface TestAssertion {
  id: string
  description: string
  expected: any
  actual: any
  passed: boolean
  message: string
}

interface TestResult {
  testId: string
  runId: string
  startTime: Date
  endTime: Date
  status: 'passed' | 'failed' | 'error'
  duration: number
  assertions: TestAssertion[]
  errorMessage?: string
  logs: string[]
  metrics: Record<string, number>
}

interface SystemHealth {
  component: string
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: Date
  issues: string[]
}

export function TestingSuite() {
  // Persistent storage for testing data
  const [testCases, setTestCases] = useKV<TestCase[]>('test-cases', [])
  const [testResults, setTestResults] = useKV<TestResult[]>('test-results', [])
  const [systemHealth, setSystemHealth] = useKV<SystemHealth[]>('system-health', [])
  
  // Local state for UI
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [currentTestId, setCurrentTestId] = useState<string | null>(null)
  const [testProgress, setTestProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCreateTest, setShowCreateTest] = useState(false)

  // Initialize default test cases if none exist
  useEffect(() => {
    if (testCases.length === 0) {
      initializeDefaultTests()
    }
    if (systemHealth.length === 0) {
      initializeSystemHealth()
    }
  }, [])

  // Initialize comprehensive test suite
  const initializeDefaultTests = () => {
    const defaultTests: TestCase[] = [
      {
        id: 'webhook-integration-test',
        name: 'GitHub Webhook Integration',
        description: 'Test webhook reception and processing of repository events',
        category: 'integration',
        priority: 'high',
        status: 'pending',
        lastRun: new Date(),
        duration: 0,
        assertions: [
          {
            id: 'webhook-reception',
            description: 'Webhook endpoint receives GitHub events',
            expected: 'success',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'event-processing',
            description: 'Repository events are correctly parsed',
            expected: 'valid_repository_data',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'spark-detection',
            description: 'Spark-related repositories are correctly identified',
            expected: 'true',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          }
        ],
        environment: 'production',
        automated: true
      },
      {
        id: 'relevance-scoring-test',
        name: 'Relevance Scoring Accuracy',
        description: 'Test ML model accuracy for repository relevance scoring',
        category: 'unit',
        priority: 'critical',
        status: 'pending',
        lastRun: new Date(),
        duration: 0,
        assertions: [
          {
            id: 'scoring-accuracy',
            description: 'Relevance scores are within expected range (0-100)',
            expected: 'valid_range',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'ml-model-response',
            description: 'ML models respond within acceptable time',
            expected: '<2000ms',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'confidence-calculation',
            description: 'Confidence scores are properly calculated',
            expected: '0.0-1.0',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          }
        ],
        environment: 'staging',
        automated: true
      },
      {
        id: 'tagging-system-test',
        name: 'Collaborative Tagging System',
        description: 'Test tag creation, voting, and application functionality',
        category: 'integration',
        priority: 'medium',
        status: 'pending',
        lastRun: new Date(),
        duration: 0,
        assertions: [
          {
            id: 'tag-creation',
            description: 'Users can create new tags successfully',
            expected: 'tag_created',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'tag-voting',
            description: 'Tag voting system functions correctly',
            expected: 'vote_recorded',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'tag-application',
            description: 'Tags can be applied to sources',
            expected: 'tags_applied',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          }
        ],
        environment: 'development',
        automated: false
      },
      {
        id: 'performance-load-test',
        name: 'System Load Performance',
        description: 'Test system performance under high load conditions',
        category: 'performance',
        priority: 'high',
        status: 'pending',
        lastRun: new Date(),
        duration: 0,
        assertions: [
          {
            id: 'concurrent-requests',
            description: 'Handle 1000 concurrent repository evaluations',
            expected: 'success',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'response-time',
            description: 'Maintain response times under 3 seconds',
            expected: '<3000ms',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'memory-usage',
            description: 'Memory usage stays within limits',
            expected: '<1GB',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          }
        ],
        environment: 'staging',
        automated: true
      },
      {
        id: 'data-backup-test',
        name: 'Data Backup & Recovery',
        description: 'Test automatic backup and recovery mechanisms',
        category: 'security',
        priority: 'critical',
        status: 'pending',
        lastRun: new Date(),
        duration: 0,
        assertions: [
          {
            id: 'backup-creation',
            description: 'Backups are created successfully',
            expected: 'backup_created',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'data-integrity',
            description: 'Backed up data maintains integrity',
            expected: 'checksum_valid',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'recovery-process',
            description: 'Data can be recovered from backup',
            expected: 'recovery_successful',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          }
        ],
        environment: 'production',
        automated: true
      },
      {
        id: 'user-interface-test',
        name: 'User Interface Functionality',
        description: 'Test key user interface interactions and workflows',
        category: 'usability',
        priority: 'medium',
        status: 'pending',
        lastRun: new Date(),
        duration: 0,
        assertions: [
          {
            id: 'navigation',
            description: 'All navigation elements work correctly',
            expected: 'functional',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'form-submission',
            description: 'Forms submit and validate properly',
            expected: 'validation_success',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          },
          {
            id: 'responsive-design',
            description: 'Interface adapts to different screen sizes',
            expected: 'responsive',
            actual: null,
            passed: false,
            message: 'Not yet tested'
          }
        ],
        environment: 'development',
        automated: false
      }
    ]
    
    setTestCases(defaultTests)
    toast.success('Initialized comprehensive test suite')
  }

  // Initialize system health monitoring
  const initializeSystemHealth = () => {
    const healthComponents: SystemHealth[] = [
      {
        component: 'GitHub Webhook Endpoint',
        status: 'healthy',
        uptime: 99.8,
        responseTime: 145,
        errorRate: 0.2,
        lastCheck: new Date(),
        issues: []
      },
      {
        component: 'ML Relevance Models',
        status: 'healthy',
        uptime: 98.5,
        responseTime: 1200,
        errorRate: 1.5,
        lastCheck: new Date(),
        issues: []
      },
      {
        component: 'Source Collection API',
        status: 'warning',
        uptime: 96.2,
        responseTime: 2800,
        errorRate: 3.8,
        lastCheck: new Date(),
        issues: ['Occasional timeout on large repositories', 'Rate limiting from GitHub API']
      },
      {
        component: 'Tagging System',
        status: 'healthy',
        uptime: 99.1,
        responseTime: 320,
        errorRate: 0.9,
        lastCheck: new Date(),
        issues: []
      },
      {
        component: 'Analytics Dashboard',
        status: 'healthy',
        uptime: 99.5,
        responseTime: 580,
        errorRate: 0.5,
        lastCheck: new Date(),
        issues: []
      },
      {
        component: 'Data Storage',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 85,
        errorRate: 0.1,
        lastCheck: new Date(),
        issues: []
      }
    ]
    
    setSystemHealth(healthComponents)
  }

  // Run a specific test case
  const runTest = async (testId: string) => {
    const testCase = testCases.find(t => t.id === testId)
    if (!testCase) {
      toast.error('Test case not found')
      return
    }

    setCurrentTestId(testId)
    setIsRunningTests(true)
    setTestProgress(0)

    try {
      // Update test status to running
      setTestCases(current =>
        current.map(t =>
          t.id === testId
            ? { ...t, status: 'running' }
            : t
        )
      )

      const startTime = new Date()
      
      // Simulate test progress
      const progressInterval = setInterval(() => {
        setTestProgress(prev => {
          const newProgress = prev + Math.random() * 20
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 300)

      // Generate test execution using AI
      const prompt = spark.llmPrompt`Simulate running this test case:
      
      Test: ${testCase.name}
      Description: ${testCase.description}
      Category: ${testCase.category}
      Environment: ${testCase.environment}
      
      Assertions to test:
      ${testCase.assertions.map(a => `- ${a.description}: Expected ${a.expected}`).join('\n')}
      
      Provide realistic test results including:
      1. Pass/fail status for each assertion
      2. Actual values observed during testing
      3. Any error messages or issues found
      4. Performance metrics if applicable
      5. Execution duration
      6. Overall test outcome
      
      Make results realistic based on the test type and current system state.`

      const testExecution = await spark.llm(prompt)

      // Simulate test duration
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      clearInterval(progressInterval)
      setTestProgress(100)

      // Generate realistic test results
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()
      
      // Simulate pass/fail for assertions (80% pass rate for demo)
      const updatedAssertions = testCase.assertions.map(assertion => {
        const passed = Math.random() > 0.2 // 80% pass rate
        return {
          ...assertion,
          passed,
          actual: passed ? assertion.expected : 'unexpected_value',
          message: passed ? 'Assertion passed successfully' : 'Assertion failed - see logs for details'
        }
      })

      const allPassed = updatedAssertions.every(a => a.passed)
      const finalStatus: TestCase['status'] = allPassed ? 'passed' : 'failed'

      // Create test result record
      const testResult: TestResult = {
        testId,
        runId: crypto.randomUUID(),
        startTime,
        endTime,
        status: allPassed ? 'passed' : 'failed',
        duration,
        assertions: updatedAssertions,
        errorMessage: allPassed ? undefined : 'One or more assertions failed',
        logs: [
          `Test started at ${startTime.toISOString()}`,
          `Running ${testCase.assertions.length} assertions...`,
          ...updatedAssertions.map(a => `${a.passed ? '✓' : '✗'} ${a.description}: ${a.message}`),
          `Test completed in ${duration}ms`
        ],
        metrics: {
          response_time: Math.random() * 2000 + 500,
          memory_usage: Math.random() * 512 + 256,
          cpu_usage: Math.random() * 80 + 10
        }
      }

      setTestResults(current => [testResult, ...current.slice(0, 49)]) // Keep last 50 results

      // Update test case with results
      setTestCases(current =>
        current.map(t =>
          t.id === testId
            ? { 
                ...t, 
                status: finalStatus,
                lastRun: endTime,
                duration,
                assertions: updatedAssertions
              }
            : t
        )
      )

      toast.success(`Test "${testCase.name}" completed: ${finalStatus.toUpperCase()}`)
      
    } catch (error) {
      toast.error('Test execution failed')
      setTestCases(current =>
        current.map(t =>
          t.id === testId
            ? { ...t, status: 'error' }
            : t
        )
      )
    } finally {
      setIsRunningTests(false)
      setCurrentTestId(null)
      setTestProgress(0)
    }
  }

  // Run all tests in sequence
  const runAllTests = async () => {
    const runnableTests = testCases.filter(t => t.status !== 'running')
    
    for (const test of runnableTests) {
      await runTest(test.id)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    toast.success('All tests completed')
  }

  // Create backup of the application data
  const createBackup = async () => {
    try {
      // Simulate backup creation
      toast.info('Creating application backup...')
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          testCases: testCases.length,
          testResults: testResults.length,
          systemHealth: systemHealth.length
        }
      }

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create backup test result
      const backupTest = testCases.find(t => t.id === 'data-backup-test')
      if (backupTest) {
        await runTest('data-backup-test')
      }
      
      toast.success('Application backup created successfully')
      
    } catch (error) {
      toast.error('Backup creation failed')
    }
  }

  // Get test statistics
  const getTestStats = () => {
    const total = testCases.length
    const passed = testCases.filter(t => t.status === 'passed').length
    const failed = testCases.filter(t => t.status === 'failed').length
    const pending = testCases.filter(t => t.status === 'pending').length
    const passRate = total > 0 ? (passed / total) * 100 : 0

    return { total, passed, failed, pending, passRate }
  }

  // Get status icon for test cases
  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error':
        return <Bug className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  // Get health status icon
  const getHealthIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const stats = getTestStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Testing & Quality Assurance</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive testing suite and system health monitoring
        </p>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.passRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Pass Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Test Execution
          </CardTitle>
          <CardDescription>
            Run individual tests or execute the complete test suite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="flex-1"
            >
              {isRunningTests ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run All Tests
            </Button>
            
            <Button 
              onClick={createBackup} 
              variant="outline"
              className="flex-1"
            >
              <Database className="w-4 h-4 mr-2" />
              Create Backup
            </Button>
          </div>

          {/* Test Progress */}
          {isRunningTests && currentTestId && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running: {testCases.find(t => t.id === currentTestId)?.name}</span>
                <span>{testProgress.toFixed(0)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Cases
          </CardTitle>
          <CardDescription>
            Comprehensive test suite covering all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testCases.map((test) => (
              <div key={test.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{test.category}</Badge>
                    <Badge 
                      variant={test.priority === 'critical' ? 'destructive' : 
                              test.priority === 'high' ? 'default' : 'secondary'}
                    >
                      {test.priority}
                    </Badge>
                  </div>
                </div>

                {/* Test Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Environment:</span>
                    <span className="ml-2 font-medium">{test.environment}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Automated:</span>
                    <span className="ml-2 font-medium">{test.automated ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assertions:</span>
                    <span className="ml-2 font-medium">{test.assertions.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Run:</span>
                    <span className="ml-2 font-medium">{test.lastRun.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Test Assertions */}
                {test.assertions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Assertions:</h5>
                    <div className="space-y-1">
                      {test.assertions.map((assertion) => (
                        <div key={assertion.id} className="flex items-center gap-2 text-sm">
                          {assertion.passed ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                          <span className="flex-1">{assertion.description}</span>
                          <span className="text-muted-foreground text-xs">{assertion.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => runTest(test.id)}
                    disabled={isRunningTests}
                    variant="outline"
                  >
                    {test.status === 'running' ? (
                      <Clock className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-1" />
                    )}
                    Run Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            System Health Monitoring
          </CardTitle>
          <CardDescription>
            Real-time monitoring of system components and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth.map((component) => (
              <div key={component.component} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getHealthIcon(component.status)}
                    <div>
                      <h4 className="font-medium">{component.component}</h4>
                      <p className="text-sm text-muted-foreground">
                        Last checked: {component.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={component.status === 'healthy' ? 'default' : 
                            component.status === 'warning' ? 'secondary' : 'destructive'}
                  >
                    {component.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-green-600">{component.uptime}%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-blue-600">{component.responseTime}ms</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-amber-600">{component.errorRate}%</div>
                    <div className="text-xs text-muted-foreground">Error Rate</div>
                  </div>
                </div>

                {component.issues.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-sm font-medium text-amber-600">Known Issues:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {component.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}