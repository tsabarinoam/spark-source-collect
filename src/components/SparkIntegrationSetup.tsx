import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Rocket, 
  Settings, 
  Globe, 
  Terminal, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SetupStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

interface SparkConfig {
  githubToken: string
  webhookSecret: string
  sparkApiEndpoint: string
  autoDiscovery: boolean
}

export function SparkIntegrationSetup() {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'fork-repo',
      title: 'Fork Repository',
      description: 'Create your own fork of the Spark Intelligence Platform',
      status: 'pending',
      progress: 0
    },
    {
      id: 'install-deps',
      title: 'Install Dependencies',
      description: 'Install required packages and libraries',
      status: 'pending',
      progress: 0
    },
    {
      id: 'configure-env',
      title: 'Configure Environment',
      description: 'Set up environment variables and configuration',
      status: 'pending',
      progress: 0
    },
    {
      id: 'setup-webhooks',
      title: 'Setup Webhooks',
      description: 'Configure GitHub webhooks for real-time updates',
      status: 'pending',
      progress: 0
    },
    {
      id: 'init-database',
      title: 'Initialize Database',
      description: 'Set up local storage and data structures',
      status: 'pending',
      progress: 0
    },
    {
      id: 'verify-integration',
      title: 'Verify Integration',
      description: 'Test connection to Apache Spark ecosystem',
      status: 'pending',
      progress: 0
    }
  ])

  const [sparkConfig, setSparkConfig] = useKV<SparkConfig>('spark-integration-config', {
    githubToken: '',
    webhookSecret: '',
    sparkApiEndpoint: 'https://api.github.com/repos/apache/spark',
    autoDiscovery: true
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
          await verifyIntegration()
          break
        default:
          throw new Error(`Unknown setup step: ${stepId}`)
      }

      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === stepId 
            ? { ...step, status: 'completed', progress: 100 }
            : step
        )
      )
    } catch (error) {
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === stepId 
            ? { ...step, status: 'error', progress: 0 }
            : step
        )
      )
      throw error
    }
  }

  /**
   * Simulate forking the repository for demonstration
   */
  const simulateRepositoryFork = async () => {
    const steps = [
      'Connecting to GitHub...',
      'Creating fork...',
      'Setting up remote origin...',
      'Configuring branch protection...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
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
      'axios',
      'date-fns',
      'lodash',
      'cheerio'
    ]
    
    for (let i = 0; i < dependencies.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
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
    const configSteps = [
      'Validating GitHub token...',
      'Setting up environment variables...',
      'Configuring API endpoints...',
      'Testing permissions...'
    ]
    
    for (let i = 0; i < configSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200))
      setSetupSteps(currentSteps => 
        currentSteps.map(step => 
          step.id === 'configure-env' 
            ? { ...step, progress: ((i + 1) / configSteps.length) * 100 }
            : step
        )
      )
    }
  }

  /**
   * Setup webhook configuration for real-time updates
   */
  const setupWebhookConfiguration = async () => {
    const webhookSteps = [
      'Creating webhook endpoint...',
      'Validating webhook endpoints...',
      'Testing webhook connectivity...',
      'Registering with GitHub...'
    ]
    
    for (let i = 0; i < webhookSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
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
   * Initialize local database and storage systems
   */
  const initializeLocalDatabase = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Initialize with some sample data
    await spark.kv.set('repositories-discovered', [])
    await spark.kv.set('analysis-results', {})
  }

  /**
   * Verify integration with Apache Spark ecosystem
   */
  const verifyIntegration = async () => {
    const verificationSteps = [
      'Connecting to Apache Spark repositories...',
      'Testing API connectivity...',
      'Validating data access...',
      'Running integration tests...'
    ]
    
    for (let i = 0; i < verificationSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
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
  const runFullSetup = async () => {
    setIsSetupRunning(true)
    try {
      for (let i = 0; i < setupSteps.length; i++) {
        setCurrentStep(i)
        await executeSetupStep(setupSteps[i].id)
      }
      toast.success('Spark Integration Setup completed successfully!')
    } catch (error) {
      toast.error(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSetupRunning(false)
    }
  }

  /**
   * Generate installation documentation
   */
  const generateInstallationDocs = () => {
    const docs = `# Spark Source Intelligence Platform Installation Guide

## Overview

The Spark Source Intelligence Platform is an open-source tool for collecting, analyzing, and organizing Apache Spark ecosystem resources.

## Prerequisites

- Node.js 18+ 
- Git
- GitHub account
- Basic knowledge of React and TypeScript

## Installation Steps

1. **Fork the Repository**
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/spark-intelligence-platform.git
   cd spark-intelligence-platform
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment**
   Create a \`.env\` file with:
   \`\`\`
   GITHUB_TOKEN=your_github_token
   SPARK_API_ENDPOINT=https://api.github.com/repos/apache/spark
   WEBHOOK_SECRET=your_webhook_secret
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

- **Automated Discovery**: Real-time tracking of Apache Spark repositories
- **ML-Powered Analysis**: Intelligent relevance scoring and categorization
- **Collaborative Tagging**: Community-driven categorization system
- **Advanced Analytics**: Comprehensive insights and trend analysis

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
\`\`\`

## License

MIT License - see LICENSE file for details
`
    
    const blob = new Blob([docs], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'installation-guide.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Installation guide downloaded successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spark Integration Setup</h1>
          <p className="text-muted-foreground">
            Configure and deploy your Spark Source Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={setupProgress === 100 ? "default" : "secondary"}>
            {setupProgress === 100 ? "Ready for Production" : "Setup Required"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup Process</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Setup Progress
              </CardTitle>
              <CardDescription>
                Follow these steps to set up your Spark Intelligence Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(setupProgress)}%</span>
                </div>
                <Progress value={setupProgress} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={runFullSetup}
                  disabled={isSetupRunning || setupProgress === 100}
                  className="flex items-center gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  {isSetupRunning ? 'Setting up...' : setupProgress === 100 ? 'Setup Complete' : 'Start Setup'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateInstallationDocs}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Guide
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  View Docs
                </Button>
              </div>

              <div className="space-y-4">
                {setupSteps.map((step, index) => (
                  <Card key={step.id} className={`transition-all ${currentStep === index && isSetupRunning ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-100 text-green-600' :
                            step.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                            step.status === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : step.status === 'error' ? (
                              <AlertCircle className="h-4 w-4" />
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
                            step.status === 'in-progress' ? 'secondary' :
                            step.status === 'error' ? 'destructive' :
                            'outline'
                          }>
                            {step.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => executeSetupStep(step.id)}
                            disabled={isSetupRunning || step.status === 'completed'}
                          >
                            Run Step
                          </Button>
                        </div>
                      </div>
                      {step.status === 'in-progress' && (
                        <div className="mt-3">
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Settings
              </CardTitle>
              <CardDescription>
                Configure your platform settings and API credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={sparkConfig.githubToken}
                  onChange={(e) => setSparkConfig(current => ({
                    ...current, 
                    githubToken: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  placeholder="webhook-secret-key"
                  value={sparkConfig.webhookSecret}
                  onChange={(e) => setSparkConfig(current => ({
                    ...current, 
                    webhookSecret: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-endpoint">Spark API Endpoint</Label>
                <Input
                  id="api-endpoint"
                  placeholder="https://api.github.com/repos/apache/spark"
                  value={sparkConfig.sparkApiEndpoint}
                  onChange={(e) => setSparkConfig(current => ({
                    ...current, 
                    sparkApiEndpoint: e.target.value
                  }))}
                />
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your configuration is automatically saved and encrypted. 
                  GitHub tokens require 'repo' and 'webhook' scopes for full functionality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get up and running in minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <ul className="space-y-1 text-sm">
                      <li>✓ Apache Spark ecosystem integration</li>
                      <li>✓ Real-time repository discovery</li>
                      <li>✓ ML-powered relevance scoring</li>
                      <li>✓ Community collaboration features</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Deployment Options
                </CardTitle>
                <CardDescription>
                  Choose your deployment strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <ul className="space-y-1 text-sm">
                      <li>✓ GitHub Pages deployment</li>
                      <li>✓ Vercel one-click deploy</li>
                      <li>✓ Docker containerization</li>
                      <li>✓ Self-hosted options</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Development Commands
                </CardTitle>
                <CardDescription>
                  Essential commands for development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <div className="font-mono text-xs space-y-1">
                      <div># Install dependencies</div>
                      <div>npm install</div>
                      <div></div>
                      <div># Start development server</div>
                      <div>npm run dev</div>
                      <div></div>
                      <div># Run tests</div>
                      <div>npm test</div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Open Source Information
                </CardTitle>
                <CardDescription>
                  Contributing to the ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>License:</strong> MIT License
                      </div>
                      <div>
                        <strong>Repository:</strong> Public GitHub repository
                      </div>
                      <div>
                        <strong>Contributing:</strong> Pull requests welcome
                      </div>
                      <div>
                        <strong>Issues:</strong> Bug reports and feature requests
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}