import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

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
  source: 'manual' | 'webhook'
}

/**
 * WebhookIntegration - Handles automatic processing of webhook events
 * This component monitors webhook events and automatically adds high-relevance
 * Spark repositories to the source collection queue for analysis.
 */
export function WebhookIntegration() {
  const [webhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [collectionJobs, setCollectionJobs] = useKV<CollectionJob[]>('collection-jobs', [])
  const [isAutoProcessing] = useKV<boolean>('auto-processing-enabled', true)

  useEffect(() => {
    if (!isAutoProcessing) return

    // Find unprocessed Spark-related events with high relevance
    const unprocessedEvents = webhookEvents.filter(
      event => 
        !event.processed && 
        event.repository.isSparkRelated && 
        event.relevanceScore && 
        event.relevanceScore > 75 // Only high-relevance repositories
    )

    if (unprocessedEvents.length === 0) return

    // Process each unprocessed event
    processWebhookEvents(unprocessedEvents)
  }, [webhookEvents, isAutoProcessing])

  const processWebhookEvents = async (events: WebhookEvent[]) => {
    for (const event of events) {
      try {
        // Check if repository is already being processed or completed
        const existingJob = collectionJobs.find(job => 
          job.url === event.repository.url
        )
        
        if (existingJob) {
          // Skip if already processed or in queue
          continue
        }

        // Create new collection job for automatic processing
        const newJob: CollectionJob = {
          id: crypto.randomUUID(),
          url: event.repository.url,
          type: 'github',
          status: 'pending',
          progress: 0,
          startTime: new Date(),
          description: `Auto-discovered via webhook: ${event.repository.description || event.repository.name}`,
          source: 'webhook'
        }

        // Add to collection queue
        setCollectionJobs(current => [...current, newJob])

        // Start processing the repository
        await processRepository(newJob, event)

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error('Failed to process webhook event:', error)
        toast.error(`Failed to process repository: ${event.repository.name}`)
      }
    }
  }

  const processRepository = async (job: CollectionJob, event: WebhookEvent) => {
    try {
      // Update job status to processing
      setCollectionJobs(current =>
        current.map(j =>
          j.id === job.id
            ? { ...j, status: 'processing', progress: 25 }
            : j
        )
      )

      // Analyze repository with Spark LLM
      const prompt = spark.llmPrompt`Perform comprehensive analysis of this Spark repository discovered via webhook:

      Repository: ${event.repository.fullName}
      URL: ${event.repository.url}
      Description: ${event.repository.description || 'No description available'}
      Language: ${event.repository.language || 'Unknown'}
      Stars: ${event.repository.stars}
      Event Type: ${event.eventType}
      Webhook Relevance Score: ${event.relevanceScore}%

      Provide detailed analysis including:
      1. Technical overview and architecture
      2. Key Spark features and components used
      3. Code quality and documentation assessment
      4. Learning value for Spark developers (beginner/intermediate/advanced)
      5. Integration patterns and best practices demonstrated
      6. Performance considerations and optimizations
      7. Testing strategies and examples
      8. Community activity and maintenance status
      9. Recommended use cases and scenarios
      10. Specific insights that make this repository valuable

      Focus on technical depth and practical applicability for the Spark ecosystem.`

      const analysis = await spark.llm(prompt)

      // Update progress
      setCollectionJobs(current =>
        current.map(j =>
          j.id === job.id
            ? { ...j, progress: 75 }
            : j
        )
      )

      // Extract key insights from the analysis
      const insights = await extractInsights(analysis, event)

      // Complete the job
      setCollectionJobs(current =>
        current.map(j =>
          j.id === job.id
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                insights
              }
            : j
        )
      )

      // Show success notification
      toast.success(
        `Auto-processed repository: ${event.repository.name}`,
        {
          description: `Found ${insights.length} key insights from automated analysis`,
          duration: 4000
        }
      )

    } catch (error) {
      // Handle processing failure
      setCollectionJobs(current =>
        current.map(j =>
          j.id === job.id
            ? {
                ...j,
                status: 'failed',
                progress: 0,
                error: 'Automated analysis failed - may require manual review'
              }
            : j
        )
      )

      console.error('Repository processing failed:', error)
    }
  }

  const extractInsights = async (analysis: string, event: WebhookEvent): Promise<string[]> => {
    // Extract structured insights from the analysis
    const insightPrompt = spark.llmPrompt`Extract 4-6 key actionable insights from this repository analysis:

    Analysis: ${analysis}

    Repository: ${event.repository.fullName}
    Language: ${event.repository.language}
    Stars: ${event.repository.stars}

    Return only the most important insights as a JSON array of strings, focused on:
    - Technical innovations or patterns
    - Performance optimizations
    - Learning opportunities
    - Integration possibilities
    - Best practices demonstrated

    Format: ["insight 1", "insight 2", "insight 3", ...]`

    try {
      const insightsJson = await spark.llm(insightPrompt, 'gpt-4o-mini', true)
      const insights = JSON.parse(insightsJson)
      
      return Array.isArray(insights) ? insights.slice(0, 6) : [
        `Advanced Spark implementation with ${event.repository.language}`,
        `Production-ready patterns and optimizations`,
        `Community-validated with ${event.repository.stars} stars`,
        `Suitable for learning modern Spark development`
      ]
    } catch (error) {
      // Fallback insights if parsing fails
      return [
        `Advanced ${event.repository.language} implementation for Spark`,
        `Production-quality code with ${event.repository.stars} community endorsements`,
        `Modern Spark development patterns and practices`,
        `Automated discovery via webhook integration`
      ]
    }
  }

  // This component doesn't render anything - it's a background processor
  return null
}

export default WebhookIntegration