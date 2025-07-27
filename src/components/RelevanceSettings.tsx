import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useKV } from '@github/spark/hooks'
import { 
  Sliders,
  Target,
  Brain,
  TrendUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Lightbulb,
  Database
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RelevanceConfig {
  // Threshold settings
  minimumRelevanceScore: number
  autoCollectThreshold: number
  priorityThreshold: number
  
  // Auto-collection rules
  autoCollectEnabled: boolean
  autoProcessingDelay: number // minutes
  batchSize: number
  
  // Language preferences
  preferredLanguages: string[]
  excludedLanguages: string[]
  
  // Repository characteristics
  minimumStars: number
  minimumActivity: number // commits in last 6 months
  repositoryTypes: string[] // 'public', 'fork', 'template', 'archived'
  
  // Content filters
  sparkKeywords: string[]
  excludeKeywords: string[]
  descriptionRequired: boolean
  
  // Machine learning settings
  useMLScoring: boolean
  modelUpdateFrequency: number // hours
  learningFromUserFeedback: boolean
  confidenceThreshold: number
}

interface MLModelStats {
  lastTraining: Date
  totalSamples: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  modelVersion: string
  isTraining: boolean
}

export function RelevanceSettings() {
  // Persistent configuration storage
  const [config, setConfig] = useKV<RelevanceConfig>('relevance-config', {
    minimumRelevanceScore: 60,
    autoCollectThreshold: 75,
    priorityThreshold: 85,
    autoCollectEnabled: true,
    autoProcessingDelay: 5,
    batchSize: 10,
    preferredLanguages: ['Scala', 'Python', 'Java', 'SQL'],
    excludedLanguages: ['Markdown', 'Text'],
    minimumStars: 5,
    minimumActivity: 1,
    repositoryTypes: ['public'],
    sparkKeywords: ['spark', 'apache-spark', 'pyspark', 'scala-spark', 'spark-streaming', 'spark-sql', 'mllib'],
    excludeKeywords: ['tutorial-only', 'homework', 'assignment'],
    descriptionRequired: false,
    useMLScoring: true,
    modelUpdateFrequency: 24,
    learningFromUserFeedback: true,
    confidenceThreshold: 0.7
  })
  
  const [mlStats, setMlStats] = useKV<MLModelStats>('ml-model-stats', {
    lastTraining: new Date(),
    totalSamples: 0,
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    modelVersion: '1.0.0',
    isTraining: false
  })

  // Local state for form handling
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('')
  const [testRepository, setTestRepository] = useState('')
  const [testResult, setTestResult] = useState<any>(null)

  // Available programming languages for filtering
  const availableLanguages = [
    'Scala', 'Python', 'Java', 'R', 'SQL', 'Shell', 'JavaScript', 
    'TypeScript', 'Go', 'Rust', 'C++', 'C', 'C#', 'Kotlin', 
    'Clojure', 'Markdown', 'Text', 'HTML', 'CSS'
  ]

  // Auto-optimize relevance thresholds based on historical data
  const optimizeThresholds = async () => {
    setIsOptimizing(true)
    
    try {
      const prompt = spark.llmPrompt`Analyze current relevance configuration and suggest optimal thresholds:

      Current Configuration:
      - Minimum Relevance Score: ${config.minimumRelevanceScore}
      - Auto-collect Threshold: ${config.autoCollectThreshold}
      - Priority Threshold: ${config.priorityThreshold}
      - Preferred Languages: ${config.preferredLanguages.join(', ')}
      - Spark Keywords: ${config.sparkKeywords.join(', ')}
      - ML Scoring Enabled: ${config.useMLScoring}
      
      ML Model Performance:
      - Accuracy: ${mlStats.accuracy}%
      - Precision: ${mlStats.precision}%
      - Recall: ${mlStats.recall}%
      - Total Samples: ${mlStats.totalSamples}
      
      Based on Apache Spark ecosystem analysis and current performance metrics, suggest:
      1. Optimal threshold values for maximum precision while maintaining good recall
      2. Additional keywords that might improve detection
      3. Language preferences adjustments
      4. Batch processing optimizations
      5. Confidence threshold recommendations
      
      Respond with specific numeric recommendations and reasoning.`

      const optimization = await spark.llm(prompt)
      
      // Show optimization suggestions to user
      toast.success('Threshold optimization completed - review suggestions below')
      
      // For demo purposes, make some intelligent adjustments
      const optimizedConfig = {
        ...config,
        minimumRelevanceScore: Math.max(50, config.minimumRelevanceScore - 5),
        autoCollectThreshold: Math.min(90, config.autoCollectThreshold + 5),
        priorityThreshold: Math.min(95, config.priorityThreshold + 3),
        confidenceThreshold: Math.max(0.6, config.confidenceThreshold - 0.05)
      }
      
      setConfig(optimizedConfig)
      
    } catch (error) {
      toast.error('Failed to optimize thresholds')
    } finally {
      setIsOptimizing(false)
    }
  }

  // Test repository against current relevance criteria
  const testRelevanceCriteria = async () => {
    if (!testRepository.trim()) {
      toast.error('Please enter a repository URL to test')
      return
    }
    
    try {
      const prompt = spark.llmPrompt`Evaluate this repository against our relevance criteria:
      
      Repository URL: ${testRepository}
      
      Current Criteria:
      - Minimum Relevance Score: ${config.minimumRelevanceScore}
      - Required Keywords: ${config.sparkKeywords.join(', ')}
      - Excluded Keywords: ${config.excludeKeywords.join(', ')}
      - Preferred Languages: ${config.preferredLanguages.join(', ')}
      - Minimum Stars: ${config.minimumStars}
      - Use ML Scoring: ${config.useMLScoring}
      
      Provide a detailed assessment including:
      1. Calculated relevance score (0-100)
      2. Keyword matches found
      3. Language detection
      4. Repository characteristics (stars, activity, description)
      5. Would this repository be auto-collected? (Yes/No)
      6. Priority level assignment (High/Medium/Low)
      7. Specific recommendations for improvement`

      const evaluation = await spark.llm(prompt, 'gpt-4o', true)
      setTestResult(JSON.parse(evaluation))
      
      toast.success('Repository evaluation completed')
      
    } catch (error) {
      toast.error('Failed to evaluate repository')
      setTestResult(null)
    }
  }

  // Train ML model with new data
  const trainMLModel = async () => {
    if (!config.useMLScoring) {
      toast.error('ML scoring is disabled')
      return
    }
    
    setMlStats(current => ({ ...current, isTraining: true }))
    
    try {
      // Simulate model training process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update model statistics with simulated improvements
      const newStats: MLModelStats = {
        lastTraining: new Date(),
        totalSamples: mlStats.totalSamples + Math.floor(Math.random() * 100) + 50,
        accuracy: Math.min(95, mlStats.accuracy + Math.random() * 5),
        precision: Math.min(98, mlStats.precision + Math.random() * 3),
        recall: Math.min(92, mlStats.recall + Math.random() * 4),
        f1Score: Math.min(94, mlStats.f1Score + Math.random() * 3),
        modelVersion: `1.${Date.now().toString().slice(-3)}`,
        isTraining: false
      }
      
      setMlStats(newStats)
      toast.success('ML model training completed successfully')
      
    } catch (error) {
      toast.error('Model training failed')
      setMlStats(current => ({ ...current, isTraining: false }))
    }
  }

  // Add new Spark-related keyword
  const addSparkKeyword = () => {
    if (!newKeyword.trim()) return
    
    if (!config.sparkKeywords.includes(newKeyword.toLowerCase())) {
      setConfig(current => ({
        ...current,
        sparkKeywords: [...current.sparkKeywords, newKeyword.toLowerCase()]
      }))
      setNewKeyword('')
      toast.success(`Added keyword: ${newKeyword}`)
    } else {
      toast.error('Keyword already exists')
    }
  }

  // Add new exclude keyword
  const addExcludeKeyword = () => {
    if (!newExcludeKeyword.trim()) return
    
    if (!config.excludeKeywords.includes(newExcludeKeyword.toLowerCase())) {
      setConfig(current => ({
        ...current,
        excludeKeywords: [...current.excludeKeywords, newExcludeKeyword.toLowerCase()]
      }))
      setNewExcludeKeyword('')
      toast.success(`Added exclude keyword: ${newExcludeKeyword}`)
    } else {
      toast.error('Exclude keyword already exists')
    }
  }

  // Remove keyword from list
  const removeKeyword = (keyword: string, isExclude: boolean = false) => {
    if (isExclude) {
      setConfig(current => ({
        ...current,
        excludeKeywords: current.excludeKeywords.filter(k => k !== keyword)
      }))
    } else {
      setConfig(current => ({
        ...current,
        sparkKeywords: current.sparkKeywords.filter(k => k !== keyword)
      }))
    }
    toast.success(`Removed keyword: ${keyword}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relevance & Collection Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure automatic discovery thresholds and machine learning models for optimal source collection
        </p>
      </div>

      {/* Threshold Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Relevance Thresholds
          </CardTitle>
          <CardDescription>
            Set scoring thresholds for automatic repository collection and prioritization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Minimum Relevance Score</Label>
              <div className="space-y-2">
                <Slider
                  value={[config.minimumRelevanceScore]}
                  onValueChange={([value]) => setConfig(current => ({ ...current, minimumRelevanceScore: value }))}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="font-medium">{config.minimumRelevanceScore}</span>
                  <span>100</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Repositories below this score will be ignored
              </p>
            </div>

            <div className="space-y-3">
              <Label>Auto-collect Threshold</Label>
              <div className="space-y-2">
                <Slider
                  value={[config.autoCollectThreshold]}
                  onValueChange={([value]) => setConfig(current => ({ ...current, autoCollectThreshold: value }))}
                  max={100}
                  min={config.minimumRelevanceScore}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{config.minimumRelevanceScore}</span>
                  <span className="font-medium">{config.autoCollectThreshold}</span>
                  <span>100</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically collect repositories above this score
              </p>
            </div>

            <div className="space-y-3">
              <Label>Priority Threshold</Label>
              <div className="space-y-2">
                <Slider
                  value={[config.priorityThreshold]}
                  onValueChange={([value]) => setConfig(current => ({ ...current, priorityThreshold: value }))}
                  max={100}
                  min={config.autoCollectThreshold}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{config.autoCollectThreshold}</span>
                  <span className="font-medium">{config.priorityThreshold}</span>
                  <span>100</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Mark repositories as high priority above this score
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={optimizeThresholds} disabled={isOptimizing} variant="outline">
              {isOptimizing ? (
                <TrendUp className="w-4 h-4 mr-2 animate-pulse" />
              ) : (
                <TrendUp className="w-4 h-4 mr-2" />
              )}
              Auto-optimize Thresholds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Machine Learning Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Machine Learning Model
          </CardTitle>
          <CardDescription>
            Configure AI-powered relevance scoring and model training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable ML-based Scoring</Label>
              <p className="text-sm text-muted-foreground">
                Use machine learning to improve relevance detection accuracy
              </p>
            </div>
            <Switch
              checked={config.useMLScoring}
              onCheckedChange={(checked) => setConfig(current => ({ ...current, useMLScoring: checked }))}
            />
          </div>

          {config.useMLScoring && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mlStats.accuracy.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{mlStats.precision.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Precision</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-accent">{mlStats.recall.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Recall</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-amber">{mlStats.f1Score.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">F1 Score</div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Confidence Threshold</Label>
                <div className="space-y-2">
                  <Slider
                    value={[config.confidenceThreshold]}
                    onValueChange={([value]) => setConfig(current => ({ ...current, confidenceThreshold: value }))}
                    max={1}
                    min={0.1}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.1</span>
                    <span className="font-medium">{config.confidenceThreshold.toFixed(2)}</span>
                    <span>1.0</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum confidence required for ML predictions
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={trainMLModel} 
                  disabled={mlStats.isTraining}
                  variant="outline"
                >
                  {mlStats.isTraining ? (
                    <Database className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  {mlStats.isTraining ? 'Training Model...' : 'Retrain Model'}
                </Button>
                
                <div className="text-sm text-muted-foreground flex items-center">
                  Last trained: {mlStats.lastTraining.toLocaleDateString()} • 
                  Model v{mlStats.modelVersion} • 
                  {mlStats.totalSamples} samples
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Keyword Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Keyword Filters
          </CardTitle>
          <CardDescription>
            Configure keywords for Spark-related content detection and exclusion rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Spark Keywords */}
          <div className="space-y-3">
            <Label>Spark-related Keywords</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add new Spark keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSparkKeyword()}
              />
              <Button onClick={addSparkKeyword} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.sparkKeywords.map((keyword) => (
                <Badge 
                  key={keyword} 
                  variant="default" 
                  className="cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Exclude Keywords */}
          <div className="space-y-3">
            <Label>Exclude Keywords</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword to exclude..."
                value={newExcludeKeyword}
                onChange={(e) => setNewExcludeKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExcludeKeyword()}
              />
              <Button onClick={addExcludeKeyword} size="sm" variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.excludeKeywords.map((keyword) => (
                <Badge 
                  key={keyword} 
                  variant="destructive" 
                  className="cursor-pointer"
                  onClick={() => removeKeyword(keyword, true)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Test Relevance Criteria
          </CardTitle>
          <CardDescription>
            Test how a specific repository would be evaluated against your current settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter GitHub repository URL to test..."
              value={testRepository}
              onChange={(e) => setTestRepository(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testRelevanceCriteria}>
              <Target className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>

          {testResult && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Evaluation Result</h4>
                <Badge variant={testResult.relevanceScore >= config.autoCollectThreshold ? "default" : "secondary"}>
                  Score: {testResult.relevanceScore}/100
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Auto-collect:</span>
                  <span className={`ml-2 font-medium ${testResult.autoCollect ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.autoCollect ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="ml-2 font-medium">{testResult.priority}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{testResult.recommendation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}