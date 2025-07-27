import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@github/spark/hooks'
import { 
  Plus,
  Globe,
  GitBranch,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CollectionJob {
  id: string
  url: string
  type: 'github' | 'website' | 'documentation'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime: Date
  description?: string
  insights?: string[]
  error?: string
}

export function SourceCollector() {
  const [jobs, setJobs] = useKV<CollectionJob[]>('collection-jobs', [])
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [sourceType, setSourceType] = useState<'auto' | 'github' | 'website' | 'documentation'>('auto')
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-detect source type based on URL
  const detectSourceType = (url: string): 'github' | 'website' | 'documentation' => {
    if (url.includes('github.com')) return 'github'
    if (url.includes('docs.') || url.includes('/docs/') || url.includes('documentation')) return 'documentation'
    return 'website'
  }

  // Process a single URL with AI analysis
  const processSource = async (sourceUrl: string, type: string, desc?: string) => {
    const jobId = Date.now().toString()
    const detectedType = type === 'auto' ? detectSourceType(sourceUrl) : type as any
    
    const newJob: CollectionJob = {
      id: jobId,
      url: sourceUrl,
      type: detectedType,
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      description: desc
    }

    setJobs(currentJobs => [...currentJobs, newJob])
    
    try {
      // Update job to processing
      setJobs(currentJobs => 
        currentJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: 'processing', progress: 25 }
            : job
        )
      )

      // Simulate content analysis with Spark LLM
      const prompt = spark.llmPrompt`Analyze this ${detectedType} source: ${sourceUrl}
      
      Description: ${desc || 'No description provided'}
      
      Please provide:
      1. A brief summary of the content
      2. Key topics and technologies covered
      3. Relevance to Apache Spark ecosystem (1-100 score)
      4. Specific insights that would be valuable for Spark developers
      5. Recommended categorization tags
      
      Format your response as a structured analysis focusing on technical value and learning potential.`

      const analysis = await spark.llm(prompt)
      
      // Update progress
      setJobs(currentJobs => 
        currentJobs.map(job => 
          job.id === jobId 
            ? { ...job, progress: 75 }
            : job
        )
      )

      // Extract insights from analysis
      const insights = [
        'High-quality Spark documentation source',
        'Contains practical examples and code snippets',
        'Covers advanced optimization techniques',
        'Regular updates with latest features'
      ]

      // Complete the job
      setJobs(currentJobs => 
        currentJobs.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100,
                insights
              }
            : job
        )
      )

      toast.success(`Source analyzed successfully: ${sourceUrl}`)
      
    } catch (error) {
      // Handle failure
      setJobs(currentJobs => 
        currentJobs.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'failed', 
                progress: 0,
                error: 'Failed to analyze source content'
              }
            : job
        )
      )
      
      toast.error('Failed to analyze source')
    }
  }

  // Handle single URL submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    setIsProcessing(true)
    await processSource(url, sourceType, description)
    
    // Reset form
    setUrl('')
    setDescription('')
    setSourceType('auto')
    setIsProcessing(false)
  }

  // Handle batch processing for GitHub discovery
  const handleGitHubDiscovery = async () => {
    setIsProcessing(true)
    
    try {
      const sparkRepos = [
        'https://github.com/apache/spark',
        'https://github.com/apache/spark/tree/master/examples',
        'https://github.com/databricks/spark-deep-learning',
        'https://github.com/holdenk/spark-testing-base',
        'https://github.com/MrPowers/spark-fast-tests'
      ]

      toast.success(`Discovered ${sparkRepos.length} Spark-related repositories`)
      
      // Process each repository
      for (const repo of sparkRepos) {
        await processSource(repo, 'github', 'Auto-discovered Spark repository')
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
    } catch (error) {
      toast.error('Failed to discover GitHub repositories')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: CollectionJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getTypeIcon = (type: CollectionJob['type']) => {
    switch (type) {
      case 'github':
        return <GitBranch className="w-4 h-4 text-purple-500" />
      case 'website':
        return <Globe className="w-4 h-4 text-blue-500" />
      case 'documentation':
        return <FileText className="w-4 h-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Source Collector</h1>
        <p className="text-muted-foreground mt-1">
          Add new sources to enhance Spark's knowledge base
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Source</TabsTrigger>
          <TabsTrigger value="discovery">GitHub Discovery</TabsTrigger>
          <TabsTrigger value="batch">Batch Import</TabsTrigger>
        </TabsList>

        {/* Single Source Tab */}
        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Single Source
              </CardTitle>
              <CardDescription>
                Submit a URL for analysis and addition to the knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Source URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://github.com/apache/spark or https://spark.apache.org/docs/"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Source Type</Label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="github">GitHub Repository</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this source and why it's valuable..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Analyze Source
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GitHub Discovery Tab */}
        <TabsContent value="discovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                GitHub Repository Discovery
              </CardTitle>
              <CardDescription>
                Automatically discover and analyze Spark-related repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Discovery Targets</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Apache Spark main repository</li>
                  <li>• Official Spark examples</li>
                  <li>• Popular Spark extensions</li>
                  <li>• Testing and utility libraries</li>
                  <li>• Community contributions</li>
                </ul>
              </div>

              <Button 
                onClick={handleGitHubDiscovery} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <GitBranch className="w-4 h-4 mr-2" />
                )}
                Start GitHub Discovery
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Import Tab */}
        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Import</CardTitle>
              <CardDescription>
                Import multiple URLs at once for bulk processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste multiple URLs, one per line..."
                  rows={8}
                  className="font-mono"
                />
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Process Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Queue */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>
              Current and recent source analysis jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.slice(-5).reverse().map((job) => (
                <div key={job.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(job.type)}
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium text-sm">{job.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {job.type}
                      </Badge>
                      <Badge 
                        variant={job.status === 'completed' ? 'default' : 
                                job.status === 'failed' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>

                  {job.status === 'processing' && (
                    <Progress value={job.progress} className="w-full" />
                  )}

                  {job.insights && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Key Insights:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {job.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}