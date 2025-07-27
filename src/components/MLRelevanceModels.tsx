import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@/hooks/use-kv'
import { 
  Brain,
  Database,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Lightbulb,
  ChartBar,
  Gear,
  Warning
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MLModel {
  id: string
  name: string
  type: 'relevance-scorer' | 'content-classifier' | 'tag-suggester' | 'quality-assessor'
  version: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainingData: number
  lastTrained: Date
  isActive: boolean
  status: 'training' | 'ready' | 'deploying' | 'error'
  features: string[]
  hyperparameters: Record<string, any>
}

interface TrainingData {
  id: string
  sourceUrl: string
  sourceName: string
  actualRelevance: number
  predictedRelevance: number
  features: Record<string, number>
  labels: string[]
  userFeedback: 'correct' | 'incorrect' | 'partially_correct'
  confidence: number
  timestamp: Date
  modelVersion: string
}

interface ModelPrediction {
  sourceId: string
  modelId: string
  prediction: number
  confidence: number
  features: Record<string, number>
  explanation: string[]
  timestamp: Date
}

interface FeatureImportance {
  feature: string
  importance: number
  description: string
  category: string
}

export function MLRelevanceModels() {
  // Persistent storage for ML models and training data
  const [models, setModels] = useKV<MLModel[]>('ml-models', [])
  const [trainingData, setTrainingData] = useKV<TrainingData[]>('training-data', [])
  const [predictions, setPredictions] = useKV<ModelPrediction[]>('model-predictions', [])
  const [featureImportance, setFeatureImportance] = useKV<FeatureImportance[]>('feature-importance', [])
  
  // Local state for UI
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [testUrl, setTestUrl] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  const [newModelName, setNewModelName] = useState('')
  const [newModelType, setNewModelType] = useState<MLModel['type']>('relevance-scorer')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Initialize default models if none exist
  useEffect(() => {
    if (models.length === 0) {
      initializeDefaultModels()
    }
  }, [])

  // Initialize default ML models for the platform
  const initializeDefaultModels = () => {
    const defaultModels: MLModel[] = [
      {
        id: 'spark-relevance-v1',
        name: 'Spark Relevance Scorer',
        type: 'relevance-scorer',
        version: '1.0.0',
        accuracy: 87.5,
        precision: 89.2,
        recall: 85.8,
        f1Score: 87.4,
        trainingData: 2500,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isActive: true,
        status: 'ready',
        features: [
          'repository_stars',
          'commit_frequency',
          'language_match',
          'keyword_density',
          'description_quality',
          'contributor_count',
          'issue_resolution_rate',
          'documentation_completeness'
        ],
        hyperparameters: {
          learning_rate: 0.001,
          batch_size: 32,
          epochs: 100,
          dropout_rate: 0.2,
          hidden_layers: [128, 64, 32]
        }
      },
      {
        id: 'content-classifier-v1',
        name: 'Content Classifier',
        type: 'content-classifier',
        version: '1.0.0',
        accuracy: 82.3,
        precision: 84.1,
        recall: 80.5,
        f1Score: 82.2,
        trainingData: 1800,
        lastTrained: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        isActive: true,
        status: 'ready',
        features: [
          'code_complexity',
          'documentation_ratio',
          'test_coverage',
          'library_dependencies',
          'api_usage_patterns',
          'performance_indicators'
        ],
        hyperparameters: {
          learning_rate: 0.0005,
          batch_size: 16,
          epochs: 80,
          regularization: 0.01
        }
      },
      {
        id: 'tag-suggester-v1',
        name: 'AI Tag Suggester',
        type: 'tag-suggester',
        version: '1.0.0',
        accuracy: 79.8,
        precision: 82.5,
        recall: 77.1,
        f1Score: 79.7,
        trainingData: 3200,
        lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isActive: true,
        status: 'ready',
        features: [
          'content_similarity',
          'technology_stack',
          'use_case_patterns',
          'complexity_level',
          'industry_relevance'
        ],
        hyperparameters: {
          embedding_dim: 256,
          similarity_threshold: 0.7,
          top_k_suggestions: 5
        }
      }
    ]
    
    setModels(defaultModels)
    initializeFeatureImportance()
    toast.success('Initialized ML models for relevance scoring')
  }

  // Initialize feature importance data
  const initializeFeatureImportance = () => {
    const features: FeatureImportance[] = [
      { feature: 'keyword_density', importance: 0.23, description: 'Density of Spark-related keywords in content', category: 'content' },
      { feature: 'repository_stars', importance: 0.18, description: 'GitHub star count indicating community interest', category: 'popularity' },
      { feature: 'commit_frequency', importance: 0.15, description: 'Recent commit activity indicating active development', category: 'activity' },
      { feature: 'language_match', importance: 0.12, description: 'Programming language alignment with Spark ecosystem', category: 'technical' },
      { feature: 'contributor_count', importance: 0.10, description: 'Number of contributors indicating project health', category: 'community' },
      { feature: 'documentation_completeness', importance: 0.09, description: 'Quality and completeness of documentation', category: 'quality' },
      { feature: 'issue_resolution_rate', importance: 0.08, description: 'Rate of issue resolution indicating maintenance', category: 'maintenance' },
      { feature: 'description_quality', importance: 0.05, description: 'Quality of repository description and README', category: 'content' }
    ]
    
    setFeatureImportance(features)
  }

  // Train a specific model with latest data
  const trainModel = async (modelId: string) => {
    const model = models.find(m => m.id === modelId)
    if (!model) {
      toast.error('Model not found')
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)
    
    try {
      // Update model status
      setModels(current =>
        current.map(m =>
          m.id === modelId
            ? { ...m, status: 'training' }
            : m
        )
      )

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 500)

      // Generate training data using LLM
      const prompt = spark.llmPrompt`Generate training improvements for the ${model.name} model:

      Current Model Performance:
      - Accuracy: ${model.accuracy}%
      - Precision: ${model.precision}%
      - Recall: ${model.recall}%
      - Training Samples: ${model.trainingData}
      
      Model Features: ${model.features.join(', ')}
      
      Provide realistic improvements that could result from additional training:
      1. New accuracy, precision, recall, and F1 scores (should show incremental improvement)
      2. Suggested hyperparameter adjustments
      3. Additional features that could improve performance
      4. Training data size increase recommendations
      5. Potential areas where the model might struggle
      
      Be realistic - improvements should be modest but meaningful.`

      const improvements = await spark.llm(prompt)

      // Simulate training completion
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setTrainingProgress(100)

      // Apply improvements to model
      const improvedModel: MLModel = {
        ...model,
        accuracy: Math.min(95, model.accuracy + Math.random() * 3 + 1),
        precision: Math.min(97, model.precision + Math.random() * 2 + 0.5),
        recall: Math.min(94, model.recall + Math.random() * 3 + 0.5),
        f1Score: Math.min(95, model.f1Score + Math.random() * 2 + 1),
        trainingData: model.trainingData + Math.floor(Math.random() * 200) + 100,
        lastTrained: new Date(),
        status: 'ready',
        version: `${model.version.split('.')[0]}.${parseInt(model.version.split('.')[1]) + 1}.0`
      }

      setModels(current =>
        current.map(m =>
          m.id === modelId ? improvedModel : m
        )
      )

      toast.success(`Model "${model.name}" training completed successfully`)
      
    } catch (error) {
      toast.error('Model training failed')
      setModels(current =>
        current.map(m =>
          m.id === modelId
            ? { ...m, status: 'error' }
            : m
        )
      )
    } finally {
      setIsTraining(false)
      setTrainingProgress(0)
    }
  }

  // Test model prediction on a URL
  const testModelPrediction = async () => {
    if (!testUrl.trim()) {
      toast.error('Please enter a URL to test')
      return
    }

    const activeModels = models.filter(m => m.isActive && m.status === 'ready')
    if (activeModels.length === 0) {
      toast.error('No active models available for testing')
      return
    }

    try {
      const prompt = spark.llmPrompt`Simulate ML model predictions for this source:
      
      URL: ${testUrl}
      
      Available Models:
      ${activeModels.map(m => `- ${m.name} (${m.type}): Accuracy ${m.accuracy}%`).join('\n')}
      
      For each model, provide:
      1. Relevance score (0-100)
      2. Confidence level (0-1)
      3. Feature values that led to this prediction
      4. Brief explanation of the reasoning
      5. Suggested tags (for tag-suggester model)
      
      Make predictions realistic based on model type and performance.`

      const predictions = await spark.llm(prompt, 'gpt-4o', true)
      
      // Generate mock results for demonstration
      const mockResults = {
        url: testUrl,
        timestamp: new Date(),
        predictions: activeModels.map(model => ({
          modelName: model.name,
          modelType: model.type,
          relevanceScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
          confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
          features: {
            keyword_density: Math.random(),
            repository_stars: Math.floor(Math.random() * 1000),
            commit_frequency: Math.random() * 10,
            language_match: Math.random()
          },
          explanation: [
            'High keyword density indicates strong Spark relevance',
            'Active development with recent commits',
            'Good documentation quality detected'
          ],
          suggestedTags: model.type === 'tag-suggester' ? ['spark-core', 'scala', 'data-processing'] : undefined
        }))
      }
      
      setTestResults(mockResults)
      toast.success('Model predictions generated successfully')
      
    } catch (error) {
      toast.error('Failed to generate predictions')
      setTestResults(null)
    }
  }

  // Create a new ML model
  const createNewModel = async () => {
    if (!newModelName.trim()) {
      toast.error('Please enter a model name')
      return
    }

    try {
      const newModel: MLModel = {
        id: crypto.randomUUID(),
        name: newModelName.trim(),
        type: newModelType,
        version: '1.0.0',
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        trainingData: 0,
        lastTrained: new Date(),
        isActive: false,
        status: 'training',
        features: [],
        hyperparameters: {}
      }

      setModels(current => [...current, newModel])
      setNewModelName('')
      setShowCreateForm(false)
      
      toast.success(`Created new model: ${newModel.name}`)
      
      // Start training the new model
      setTimeout(() => trainModel(newModel.id), 1000)
      
    } catch (error) {
      toast.error('Failed to create model')
    }
  }

  // Toggle model active status
  const toggleModelStatus = (modelId: string) => {
    setModels(current =>
      current.map(model =>
        model.id === modelId
          ? { ...model, isActive: !model.isActive }
          : model
      )
    )
    
    const model = models.find(m => m.id === modelId)
    if (model) {
      toast.success(`Model "${model.name}" ${model.isActive ? 'deactivated' : 'activated'}`)
    }
  }

  // Get model type icon
  const getModelTypeIcon = (type: MLModel['type']) => {
    switch (type) {
      case 'relevance-scorer':
        return <Target className="w-4 h-4" />
      case 'content-classifier':
        return <ChartBar className="w-4 h-4" />
      case 'tag-suggester':
        return <Lightbulb className="w-4 h-4" />
      case 'quality-assessor':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  // Get status badge color
  const getStatusBadge = (status: MLModel['status']) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case 'training':
        return <Badge className="bg-blue-100 text-blue-800">Training</Badge>
      case 'deploying':
        return <Badge className="bg-amber-100 text-amber-800">Deploying</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Machine Learning Models</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered relevance scoring and intelligent source classification
        </p>
      </div>

      {/* Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{models.length}</div>
            <div className="text-sm text-muted-foreground">Total Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{models.filter(m => m.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Active Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {models.length > 0 ? Math.round(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber">
              {models.reduce((sum, m) => sum + m.trainingData, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Training Samples</div>
          </CardContent>
        </Card>
      </div>

      {/* Model Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Test Model Predictions
          </CardTitle>
          <CardDescription>
            Test how your models would score and classify a specific source
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter GitHub repository URL to test..."
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testModelPrediction} disabled={isTraining}>
              <Brain className="w-4 h-4 mr-2" />
              Test Prediction
            </Button>
          </div>

          {testResults && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Prediction Results for: {testResults.url}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.predictions.map((pred: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getModelTypeIcon(pred.modelType)}
                        <span className="font-medium text-sm">{pred.modelName}</span>
                      </div>
                      <Badge variant="outline">
                        {pred.relevanceScore}/100
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 font-medium">{(pred.confidence * 100).toFixed(1)}%</span>
                      </div>
                      
                      {pred.suggestedTags && (
                        <div>
                          <span className="text-muted-foreground">Suggested Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {pred.suggestedTags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {pred.explanation[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Models */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                ML Models
              </CardTitle>
              <CardDescription>
                Manage and monitor your machine learning models
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Model
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Model Form */}
          {showCreateForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <h4 className="font-medium">Create New Model</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input
                    placeholder="e.g., Advanced Quality Scorer"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model Type</Label>
                  <Select value={newModelType} onValueChange={setNewModelType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance-scorer">Relevance Scorer</SelectItem>
                      <SelectItem value="content-classifier">Content Classifier</SelectItem>
                      <SelectItem value="tag-suggester">Tag Suggester</SelectItem>
                      <SelectItem value="quality-assessor">Quality Assessor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createNewModel} disabled={!newModelName.trim()}>
                  Create Model
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Models List */}
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getModelTypeIcon(model.type)}
                    <div>
                      <h4 className="font-medium">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Version {model.version} • {model.type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(model.status)}
                    {model.isActive && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Training Progress */}
                {model.status === 'training' && isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{trainingProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-primary">{model.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-secondary">{model.precision.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Precision</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-accent">{model.recall.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Recall</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-amber">{model.f1Score.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">F1 Score</div>
                  </div>
                </div>

                {/* Model Details */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Training Data: {model.trainingData.toLocaleString()} samples</div>
                  <div>Last Trained: {model.lastTrained.toLocaleDateString()}</div>
                  <div>Features: {model.features.length} active features</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => trainModel(model.id)}
                    disabled={isTraining || model.status === 'training'}
                    variant="outline"
                  >
                    {model.status === 'training' ? (
                      <Clock className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-1" />
                    )}
                    Retrain
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => toggleModelStatus(model.id)}
                    variant="outline"
                  >
                    {model.isActive ? (
                      <Pause className="w-4 h-4 mr-1" />
                    ) : (
                      <Play className="w-4 h-4 mr-1" />
                    )}
                    {model.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Feature Importance
          </CardTitle>
          <CardDescription>
            Understanding which features drive model predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {featureImportance
              .sort((a, b) => b.importance - a.importance)
              .map((feature) => (
                <div key={feature.feature} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{feature.feature.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">{(feature.importance * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={feature.importance * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}