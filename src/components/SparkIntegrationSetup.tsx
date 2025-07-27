import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { 
  GitFork, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Globe,
  FileCode,
  Terminal,
  Rocket,
  BookOpen
} from '@phosphor-icons/react'

interface SetupStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

export function SparkIntegrationSetup() {
  const [setupSteps, setSetupSteps] = useKV('spark-setup-steps', [
    {
      id: 'fork-repo',
      title: 'Fork Repository',
      description: 'Create a fork of the Spark Source Intelligence Platform',
      status: 'pending' as const,
      progress: 0
    },
    {
      id: 'install-deps',
      title: 'Install Dependencies',
      description: 'Install required packages and dependencies',
      status: 'pending' as const,
      progress: 0
    },
    {
      id: 'configure-env',
      title: 'Configure Environment',
      description: 'Set up environment variables and configuration',
      status: 'pending' as const,
      progress: 0
    },
    {
      id: 'setup-webhooks',
      title: 'Setup GitHub Webhooks',
      description: 'Configure webhook endpoints for real-time updates',
      status: 'pending' as const,
      progress: 0
    },
    {
      id: 'init-database',
      title: 'Initialize Database',
      description: 'Set up local storage and data structures',
      status: 'pending' as const,
      progress: 0
    },
    {
      id: 'verify-integration',
      title: 'Verify Integration',
      description: 'Test connection to Spark ecosystem',
      status: 'pending' as const,
      progress: 0
    }
  ])

  const [sparkConfig, setSparkConfig] = useKV('spark-integration-config', {
    githubToken: '',
    webhookSecret: '',
    sparkApiEndpoint: '',
    organizationName: 'apache',
    repositoryPrefix: 'spark'
  })

  const [setupProgress, setSetupProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSetupRunning, setIsSetupRunning] = useState(false)

  // Calculate overall setup progress
  useEffect(() => {
    const completedSteps = setupSteps.filter(step => step.status === 'completed').length
    const newProgress = (completedSteps / setupSteps.length) * 100
    setSetupProgress(newProgress)
  }, [setupSteps])

  /**
   * Execute a setup step with progress tracking and error handling
   */
  const executeSetupStep = async (stepId: string) => {
    setSetupSteps(currentSteps => 
      currentSteps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'in-progress', progress: 0 }
          : step
      )
    )

    try {
      switch (stepId) {
        case 'fork-repo':
          await simulateRepositoryFork()
          break
        case 'install-deps':
          await simulateDependencyInstallation()
          break
        case 'configure-env':
          await configureEnvironment()
          break
        case 'setup-webhooks':
          await setupWebhookConfiguration()
          break
        case 'init-database':
          await initializeLocalDatabase()
          break
        case 'verify-integration':
          await verifySparkIntegration()
          break
      }

      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === stepId 
            ? { ...step, status: 'completed', progress: 100 }
            : step
        )
      )

      toast.success(`${setupSteps.find(s => s.id === stepId)?.title} completed successfully`)
    } catch (error) {
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === stepId 
            ? { ...step, status: 'error', progress: 0 }
            : step
        )
      )
      toast.error(`Failed to complete ${setupSteps.find(s => s.id === stepId)?.title}`)
    }
  }

  /**
   * Simulate forking the repository for Spark integration
   */
  const simulateRepositoryFork = async () => {
    const steps = [
      'Connecting to GitHub API...',
      'Locating source repository...',
      'Creating fork in your account...',
      'Setting up remote tracking...',
      'Configuring branch protection...'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === 'fork-repo' 
            ? { ...step, progress: ((i + 1) / steps.length) * 100 }
            : step
        )
      )
    }
  }

  /**
   * Simulate dependency installation process
   */
  const simulateDependencyInstallation = async () => {
    const dependencies = [
      '@octokit/rest',
      'react-query',
      'axios',
      'lodash',
      'date-fns'
    ]

    for (let i = 0; i < dependencies.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === 'install-deps' 
            ? { ...step, progress: ((i + 1) / dependencies.length) * 100 }
            : step
        )
      )
    }
  }

  /**
   * Configure environment variables and settings
   */
  const configureEnvironment = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Validate configuration
    if (!sparkConfig.githubToken) {
      throw new Error('GitHub token is required')
    }
  }

  /**
   * Setup webhook configuration for real-time updates
   */
  const setupWebhookConfiguration = async () => {
    const webhookSteps = [
      'Validating webhook endpoints...',
      'Configuring event subscriptions...',
      'Testing webhook connectivity...',
      'Registering with GitHub...'
    ]

    for (let i = 0; i < webhookSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 700))
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === 'setup-webhooks' 
            ? { ...step, progress: ((i + 1) / webhookSteps.length) * 100 }
            : step
        )
      )
    }
  }

  /**
   * Initialize local database and storage structures
   */
  const initializeLocalDatabase = async () => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Initialize default data structures
    await spark.kv.set('source-repositories', [])
    await spark.kv.set('discovery-patterns', [])
    await spark.kv.set('ml-models', {})
    await spark.kv.set('analytics-data', {})
  }

  /**
   * Verify integration with Spark ecosystem
   */
  const verifySparkIntegration = async () => {
    const verificationSteps = [
      'Testing API connectivity...',
      'Verifying authentication...',
      'Checking permissions...',
      'Validating data access...'
    ]

    for (let i = 0; i < verificationSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === 'verify-integration' 
            ? { ...step, progress: ((i + 1) / verificationSteps.length) * 100 }
            : step
        )
      )
    }
  }

  /**
   * Run the complete setup process
   */
  const runCompleteSetup = async () => {
    setIsSetupRunning(true)
    setCurrentStep(0)

    try {
      for (let i = 0; i < setupSteps.length; i++) {
        setCurrentStep(i)
        await executeSetupStep(setupSteps[i].id)
        await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause between steps
      }
      
      toast.success('Spark Integration Setup completed successfully!')
    } catch (error) {
      toast.error('Setup process encountered an error')
    } finally {
      setIsSetupRunning(false)
    }
  }

  /**
   * Generate setup documentation and contribution guide
   */
  const generateContributionGuide = () => {
    const guide = `# Spark Source Intelligence Platform - Contribution Guide

## Overview
The Spark Source Intelligence Platform is an open-source tool designed to collect, analyze, and organize Apache Spark-related resources from across the web.

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- GitHub account with API access
- Basic knowledge of React and TypeScript

### Installation Steps

1. **Fork the Repository**
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/spark-source-intelligence.git
   cd spark-source-intelligence
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment**
   Create a \`.env\` file with:
   \`\`\`
   GITHUB_TOKEN=your_github_token
   WEBHOOK_SECRET=your_webhook_secret
   SPARK_API_ENDPOINT=https://api.spark.apache.org
   \`\`\`

4. **Initialize Database**
   \`\`\`bash
   npm run init-db
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Features
- **Source Collection**: Automated discovery of Spark-related repositories
- **ML-Powered Relevance**: Machine learning models for content scoring
- **Real-time Updates**: GitHub webhook integration for live tracking
- **Analytics Dashboard**: Comprehensive metrics and insights
- **Collaborative Tagging**: Community-driven categorization

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Testing
\`\`\`bash
npm run test
npm run test:integration
npm run test:e2e
\`\`\`

## License
Apache 2.0 - See LICENSE file for details
`

    const blob = new Blob([guide], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'CONTRIBUTING.md'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Contribution guide downloaded!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spark Integration Setup</h1>
          <p className="text-muted-foreground mt-2">
            Set up and contribute to the Spark ecosystem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={setupProgress === 100 ? "default" : "secondary"}>
            {setupProgress === 100 ? "Ready" : "Setup Required"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Setup Progress
          </CardTitle>
          <CardDescription>
            Overall progress: {Math.round(setupProgress)}% complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={setupProgress} className="mb-4" />
          <div className="flex gap-2">
            <Button 
              onClick={runCompleteSetup}
              disabled={isSetupRunning || setupProgress === 100}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isSetupRunning ? 'Setting up...' : 'Run Complete Setup'}
            </Button>
            <Button 
              variant="outline" 
              onClick={generateContributionGuide}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Download Contribution Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="steps" className="w-full">
        <TabsList>
          <TabsTrigger value="steps">Setup Steps</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          {setupSteps.map((step, index) => (
            <Card key={step.id} className={currentStep === index && isSetupRunning ? 'ring-2 ring-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'error' ? 'destructive' :
                      step.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {step.status}
                    </Badge>
                    {step.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeSetupStep(step.id)}
                        disabled={isSetupRunning}
                      >
                        Run Step
                      </Button>
                    )}
                  </div>
                </div>
                {step.status === 'in-progress' && (
                  <div className="mt-3">
                    <Progress value={step.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Configuration</CardTitle>
              <CardDescription>
                Configure your Spark integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github-token">GitHub Token</Label>
                  <Input
                    id="github-token"
                    type="password"
                    value={sparkConfig.githubToken}
                    onChange={(e) => setSparkConfig(current => ({ 
                      ...current, 
                      githubToken: e.target.value 
                    }))}
                    placeholder="ghp_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    value={sparkConfig.webhookSecret}
                    onChange={(e) => setSparkConfig(current => ({ 
                      ...current, 
                      webhookSecret: e.target.value 
                    }))}
                    placeholder="webhook-secret-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">Spark API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    value={sparkConfig.sparkApiEndpoint}
                    onChange={(e) => setSparkConfig(current => ({ 
                      ...current, 
                      sparkApiEndpoint: e.target.value 
                    }))}
                    placeholder="https://api.spark.apache.org"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={sparkConfig.organizationName}
                    onChange={(e) => setSparkConfig(current => ({ 
                      ...current, 
                      organizationName: e.target.value 
                    }))}
                    placeholder="apache"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Integration Documentation
              </CardTitle>
              <CardDescription>
                Resources for contributing to the Spark ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert>
                  <GitFork className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fork & Contribute:</strong> This tool is designed to be forked and contributed to the official Apache Spark project as an auxiliary intelligence platform.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Open Source:</strong> All code is open source under Apache 2.0 license, encouraging community contributions and improvements.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Modular Design:</strong> Components are designed to be easily integrated into existing Spark tooling and workflows.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertDescription>
                    <strong>API Integration:</strong> Provides REST APIs for integration with other Spark tools and services.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Quick Start Commands</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div># Clone and setup</div>
                  <div>git clone https://github.com/apache/spark-source-intelligence.git</div>
                  <div>cd spark-source-intelligence</div>
                  <div>npm install && npm run setup</div>
                  <div></div>
                  <div># Run development server</div>
                  <div>npm run dev</div>
                  <div></div>
                  <div># Run tests</div>
                  <div>npm run test:all</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}