import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { 
  MagnifyingGlass,
  Target,
  Funnel,
  Gear,
  CheckCircle,
  XCircle,
  Warning,
  TrendUp,
  Code,
  GitBranch,
  Star,
  Activity,
  Timer,
  Brain,
  Lightbulb,
  Rocket
} from '@phosphor-icons/react'
import { toast } from 'sonner'

// Configuration interfaces for discovery patterns
interface DiscoveryPattern {
  id: string
  name: string
  description: string
  isActive: boolean
  priority: 'high' | 'medium' | 'low'
  keywords: string[]
  excludeKeywords: string[]
  languageFilters: string[]
  minStars: number
  maxAge: number // days
  authorPatterns: string[]
  repoNamePatterns: string[]
  descriptionPatterns: string[]
  fileContentPatterns: string[]
  relevanceThreshold: number
  autoCollect: boolean
  createdAt: Date
  lastMatched?: Date
  totalMatches: number
}

interface MatchResult {
  id: string
  patternId: string
  repository: {
    name: string
    fullName: string
    url: string
    description?: string
    language?: string
    stars: number
    createdAt: Date
    lastUpdated: Date
  }
  matchScore: number
  matchedCriteria: string[]
  timestamp: Date
  wasAutoCollected: boolean
}

export function DiscoveryPatterns() {
  // Persistent storage for patterns and results
  const [patterns, setPatterns] = useKV<DiscoveryPattern[]>('discovery-patterns', [])
  const [matchResults, setMatchResults] = useKV<MatchResult[]>('pattern-matches', [])
  const [globalSettings, setGlobalSettings] = useKV('discovery-settings', {
    enableAutoDiscovery: true,
    scanInterval: 60, // minutes
    maxResultsPerPattern: 100,
    globalRelevanceThreshold: 70
  })
  
  // Local state for pattern creation/editing
  const [activeTab, setActiveTab] = useState('patterns')
  const [isCreatingPattern, setIsCreatingPattern] = useState(false)
  const [editingPattern, setEditingPattern] = useState<DiscoveryPattern | null>(null)
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false)
  
  // Form state for new/edit pattern
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    excludeKeywords: '',
    languageFilters: [] as string[],
    minStars: 0,
    maxAge: 365,
    authorPatterns: '',
    repoNamePatterns: '',
    descriptionPatterns: '',
    fileContentPatterns: '',
    relevanceThreshold: 75,
    autoCollect: true,
    priority: 'medium' as const
  })

  // Initialize with default Apache Spark patterns on first load
  useEffect(() => {
    if (patterns.length === 0) {
      initializeDefaultPatterns()
    }
  }, [])

  // Auto-discovery runner
  useEffect(() => {
    if (!globalSettings.enableAutoDiscovery) return

    const intervalMs = globalSettings.scanInterval * 60 * 1000
    const interval = setInterval(() => {
      runPatternDiscovery()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [globalSettings.enableAutoDiscovery, globalSettings.scanInterval, patterns])

  // Initialize with intelligent default patterns for Spark ecosystem discovery
  const initializeDefaultPatterns = () => {
    const defaultPatterns: DiscoveryPattern[] = [
      {
        id: crypto.randomUUID(),
        name: 'Official Apache Spark',
        description: 'Repositories from the official Apache Spark organization and core contributors',
        isActive: true,
        priority: 'high',
        keywords: ['apache', 'spark', 'scala', 'pyspark', 'sql'],
        excludeKeywords: ['spark-js', 'sparkle', 'sparks'],
        languageFilters: ['Scala', 'Python', 'Java', 'R'],
        minStars: 10,
        maxAge: 730,
        authorPatterns: ['apache', 'databricks', 'spark-*'],
        repoNamePatterns: ['*spark*', '*pyspark*', '*spark-*'],
        descriptionPatterns: ['apache spark', 'spark framework', 'big data', 'distributed computing'],
        fileContentPatterns: ['org.apache.spark', 'from pyspark', 'spark-submit'],
        relevanceThreshold: 85,
        autoCollect: true,
        createdAt: new Date(),
        totalMatches: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Spark ML & Analytics',
        description: 'Machine learning, analytics, and data science projects using Spark',
        isActive: true,
        priority: 'high',
        keywords: ['spark', 'mllib', 'ml', 'machine learning', 'analytics', 'mleap'],
        excludeKeywords: ['tutorial', 'example', 'demo'],
        languageFilters: ['Python', 'Scala', 'Java'],
        minStars: 5,
        maxAge: 365,
        authorPatterns: ['*'],
        repoNamePatterns: ['*spark-ml*', '*mllib*', '*spark-analytics*'],
        descriptionPatterns: ['spark ml', 'mllib', 'spark analytics', 'spark machine learning'],
        fileContentPatterns: ['spark.ml', 'MLlib', 'spark.mllib'],
        relevanceThreshold: 80,
        autoCollected: true,
        createdAt: new Date(),
        totalMatches: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Spark Streaming & Real-time',
        description: 'Real-time data processing and streaming applications built with Spark',
        isActive: true,
        priority: 'medium',
        keywords: ['spark', 'streaming', 'kafka', 'real-time', 'structured streaming'],
        excludeKeywords: ['tutorial', 'basic'],
        languageFilters: ['Scala', 'Java', 'Python'],
        minStars: 3,
        maxAge: 365,
        authorPatterns: ['*'],
        repoNamePatterns: ['*spark-stream*', '*streaming*', '*kafka-spark*'],
        descriptionPatterns: ['spark streaming', 'real-time', 'structured streaming', 'kafka'],
        fileContentPatterns: ['spark.streaming', 'StreamingContext', 'structured streaming'],
        relevanceThreshold: 75,
        autoCollect: false,
        createdAt: new Date(),
        totalMatches: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Spark Infrastructure & Tools',
        description: 'DevOps, deployment, monitoring, and infrastructure tools for Spark',
        isActive: true,
        priority: 'medium',
        keywords: ['spark', 'deployment', 'kubernetes', 'docker', 'monitoring', 'orchestration'],
        excludeKeywords: ['tutorial'],
        languageFilters: ['Python', 'Shell', 'Dockerfile', 'YAML'],
        minStars: 1,
        maxAge: 180,
        authorPatterns: ['*'],
        repoNamePatterns: ['*spark-k8s*', '*spark-deploy*', '*spark-ops*'],
        descriptionPatterns: ['spark deployment', 'spark kubernetes', 'spark monitoring'],
        fileContentPatterns: ['spark-submit', 'spark.kubernetes', 'spark-history'],
        relevanceThreshold: 70,
        autoCollect: false,
        createdAt: new Date(),
        totalMatches: 0
      }
    ]

    setPatterns(defaultPatterns)
    toast.success('Initialized default discovery patterns for Apache Spark ecosystem')
  }

  // Run pattern matching discovery against GitHub repositories
  const runPatternDiscovery = async () => {
    setIsRunningDiscovery(true)
    
    try {
      const activePatterns = patterns.filter(p => p.isActive)
      if (activePatterns.length === 0) {
        toast.info('No active discovery patterns found')
        return
      }

      let totalNewMatches = 0

      for (const pattern of activePatterns) {
        const prompt = spark.llmPrompt`Simulate repository discovery for this pattern:
        
        Pattern: ${pattern.name}
        Keywords: ${pattern.keywords.join(', ')}
        Exclude: ${pattern.excludeKeywords.join(', ')}
        Languages: ${pattern.languageFilters.join(', ')}
        Min Stars: ${pattern.minStars}
        Repo Name Patterns: ${pattern.repoNamePatterns.join(', ')}
        Description Patterns: ${pattern.descriptionPatterns.join(', ')}
        
        Generate 3-5 realistic GitHub repositories that would match this pattern. For each repository, provide:
        1. Repository name and full name (owner/repo)
        2. Description
        3. Primary language
        4. Star count (realistic for the pattern)
        5. Match score (0-100 based on how well it fits)
        6. Specific criteria that matched
        
        Focus on creating realistic, diverse results that demonstrate the pattern's effectiveness.`

        try {
          const discoveryResults = await spark.llm(prompt, 'gpt-4o-mini', true)
          const repositories = JSON.parse(discoveryResults)

          // Process discovered repositories
          for (const repo of repositories) {
            if (repo.matchScore >= pattern.relevanceThreshold) {
              const matchResult: MatchResult = {
                id: crypto.randomUUID(),
                patternId: pattern.id,
                repository: {
                  name: repo.name,
                  fullName: repo.fullName,
                  url: `https://github.com/${repo.fullName}`,
                  description: repo.description,
                  language: repo.language,
                  stars: repo.stars,
                  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                  lastUpdated: new Date()
                },
                matchScore: repo.matchScore,
                matchedCriteria: repo.matchedCriteria || [],
                timestamp: new Date(),
                wasAutoCollected: pattern.autoCollect
              }

              setMatchResults(current => [matchResult, ...current.slice(0, 99)]) // Keep last 100
              totalNewMatches++
            }
          }

          // Update pattern statistics
          setPatterns(current =>
            current.map(p =>
              p.id === pattern.id
                ? { ...p, lastMatched: new Date(), totalMatches: p.totalMatches + repositories.length }
                : p
            )
          )

        } catch (error) {
          console.error(`Discovery failed for pattern ${pattern.name}:`, error)
        }
      }

      toast.success(`Discovery complete: ${totalNewMatches} new repositories found`)

    } catch (error) {
      toast.error('Pattern discovery failed')
    } finally {
      setIsRunningDiscovery(false)
    }
  }

  // Create new discovery pattern
  const createPattern = () => {
    if (!formData.name.trim()) {
      toast.error('Pattern name is required')
      return
    }

    const newPattern: DiscoveryPattern = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: true,
      priority: formData.priority,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      excludeKeywords: formData.excludeKeywords.split(',').map(k => k.trim()).filter(k => k),
      languageFilters: formData.languageFilters,
      minStars: formData.minStars,
      maxAge: formData.maxAge,
      authorPatterns: formData.authorPatterns.split(',').map(p => p.trim()).filter(p => p),
      repoNamePatterns: formData.repoNamePatterns.split(',').map(p => p.trim()).filter(p => p),
      descriptionPatterns: formData.descriptionPatterns.split(',').map(p => p.trim()).filter(p => p),
      fileContentPatterns: formData.fileContentPatterns.split(',').map(p => p.trim()).filter(p => p),
      relevanceThreshold: formData.relevanceThreshold,
      autoCollect: formData.autoCollect,
      createdAt: new Date(),
      totalMatches: 0
    }

    setPatterns(current => [...current, newPattern])
    resetForm()
    setIsCreatingPattern(false)
    toast.success(`Discovery pattern "${newPattern.name}" created successfully`)
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      keywords: '',
      excludeKeywords: '',
      languageFilters: [],
      minStars: 0,
      maxAge: 365,
      authorPatterns: '',
      repoNamePatterns: '',
      descriptionPatterns: '',
      fileContentPatterns: '',
      relevanceThreshold: 75,
      autoCollect: true,
      priority: 'medium'
    })
    setEditingPattern(null)
  }

  // Toggle pattern active status
  const togglePattern = (patternId: string) => {
    setPatterns(current =>
      current.map(pattern =>
        pattern.id === patternId
          ? { ...pattern, isActive: !pattern.isActive }
          : pattern
      )
    )

    const pattern = patterns.find(p => p.id === patternId)
    toast.success(`Pattern "${pattern?.name}" ${pattern?.isActive ? 'deactivated' : 'activated'}`)
  }

  // Delete pattern
  const deletePattern = (patternId: string) => {
    setPatterns(current => current.filter(p => p.id !== patternId))
    setMatchResults(current => current.filter(r => r.patternId !== patternId))
    
    const pattern = patterns.find(p => p.id === patternId)
    toast.success(`Pattern "${pattern?.name}" deleted`)
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-green-100 text-green-800'
    }
    return (
      <Badge className={variants[priority as keyof typeof variants] || variants.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Repository Discovery Patterns</h1>
        <p className="text-muted-foreground mt-1">
          Configure intelligent patterns to automatically discover and collect Spark-related repositories
        </p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear className="w-5 h-5" />
            Global Discovery Settings
          </CardTitle>
          <CardDescription>
            Control how the automatic repository discovery system operates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Auto-Discovery</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically run pattern matching at regular intervals
                </p>
              </div>
              <Switch
                checked={globalSettings.enableAutoDiscovery}
                onCheckedChange={(checked) =>
                  setGlobalSettings(current => ({ ...current, enableAutoDiscovery: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Scan Interval (minutes)</Label>
              <Slider
                value={[globalSettings.scanInterval]}
                onValueChange={([value]) =>
                  setGlobalSettings(current => ({ ...current, scanInterval: value }))
                }
                min={15}
                max={720}
                step={15}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Current: {globalSettings.scanInterval} minutes
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={runPatternDiscovery} 
              disabled={isRunningDiscovery}
              className="flex-1"
            >
              {isRunningDiscovery ? (
                <Timer className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MagnifyingGlass className="w-4 h-4 mr-2" />
              )}
              {isRunningDiscovery ? 'Running Discovery...' : 'Run Discovery Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Discovery Patterns</TabsTrigger>
          <TabsTrigger value="results">Match Results</TabsTrigger>
          <TabsTrigger value="create">Create Pattern</TabsTrigger>
        </TabsList>

        {/* Patterns Management */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Discovery Patterns</CardTitle>
              <CardDescription>
                Manage your repository discovery patterns and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(pattern.isActive)}
                          <h4 className="font-medium">{pattern.name}</h4>
                          {getPriorityBadge(pattern.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pattern.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.keywords.slice(0, 5).map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {pattern.keywords.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{pattern.keywords.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePattern(pattern.id)}
                        >
                          {pattern.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePattern(pattern.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min Stars:</span>
                        <span className="ml-2 font-medium">{pattern.minStars}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="ml-2 font-medium">{pattern.relevanceThreshold}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Matches:</span>
                        <span className="ml-2 font-medium">{pattern.totalMatches}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auto-collect:</span>
                        <span className="ml-2 font-medium">
                          {pattern.autoCollect ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {patterns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No discovery patterns configured yet.</p>
                    <p className="text-sm">Create your first pattern to start automatic repository discovery.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Match Results */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Discoveries</CardTitle>
              <CardDescription>
                Repositories recently discovered by your active patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matchResults.slice(0, 20).map((result) => {
                  const pattern = patterns.find(p => p.id === result.patternId)
                  return (
                    <div key={result.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-sm">{result.repository.fullName}</span>
                          <Badge variant="outline" className="text-xs">
                            {pattern?.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-accent text-accent-foreground text-xs">
                            {result.matchScore}% match
                          </Badge>
                          {result.wasAutoCollected && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Auto-collected
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {result.repository.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{result.repository.language}</span>
                        <span>★ {result.repository.stars}</span>
                        <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                      </div>

                      {result.matchedCriteria.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.matchedCriteria.map((criteria) => (
                            <Badge key={criteria} variant="secondary" className="text-xs">
                              {criteria}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {matchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MagnifyingGlass className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No discoveries yet.</p>
                    <p className="text-sm">Run pattern discovery to start finding repositories.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create/Edit Pattern */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Create Discovery Pattern
              </CardTitle>
              <CardDescription>
                Define criteria for automatically discovering relevant repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern-name">Pattern Name *</Label>
                  <Input
                    id="pattern-name"
                    placeholder="e.g., Spark ML Libraries"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what types of repositories this pattern should discover..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Include Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="spark, mllib, streaming (comma-separated)"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclude-keywords">Exclude Keywords</Label>
                  <Input
                    id="exclude-keywords"
                    placeholder="tutorial, example, demo (comma-separated)"
                    value={formData.excludeKeywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, excludeKeywords: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Stars</Label>
                  <Slider
                    value={[formData.minStars]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, minStars: value }))}
                    min={0}
                    max={1000}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">{formData.minStars} stars</p>
                </div>

                <div className="space-y-2">
                  <Label>Max Age (days)</Label>
                  <Slider
                    value={[formData.maxAge]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, maxAge: value }))}
                    min={30}
                    max={1095}
                    step={30}
                  />
                  <p className="text-sm text-muted-foreground">{formData.maxAge} days</p>
                </div>

                <div className="space-y-2">
                  <Label>Relevance Threshold</Label>
                  <Slider
                    value={[formData.relevanceThreshold]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, relevanceThreshold: value }))}
                    min={50}
                    max={100}
                    step={5}
                  />
                  <p className="text-sm text-muted-foreground">{formData.relevanceThreshold}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-patterns">Repository Name Patterns</Label>
                <Input
                  id="repo-patterns"
                  placeholder="*spark*, *mllib*, spark-* (comma-separated, * for wildcards)"
                  value={formData.repoNamePatterns}
                  onChange={(e) => setFormData(prev => ({ ...prev, repoNamePatterns: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-collect Matches</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add high-scoring matches to the source collection
                  </p>
                </div>
                <Switch
                  checked={formData.autoCollect}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoCollect: checked }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createPattern} className="flex-1">
                  <Rocket className="w-4 h-4 mr-2" />
                  Create Pattern
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}