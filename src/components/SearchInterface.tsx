import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useKV } from '@github/spark/hooks'
import { 
  MagnifyingGlass,
  FunnelSimple,
  GitBranch,
  Globe,
  FileText,
  Calendar,
  Star,
  ExternalLink,
  Sparkles,
  SortAscending
} from '@phosphor-icons/react'

interface SearchResult {
  id: string
  title: string
  url: string
  description: string
  type: 'github' | 'website' | 'documentation'
  relevanceScore: number
  tags: string[]
  lastAnalyzed: Date
  insights: string[]
  domain: string
}

interface SearchFilters {
  types: string[]
  domains: string[]
  scoreRange: [number, number]
  dateRange: string
  sortBy: 'relevance' | 'date' | 'score'
}

export function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useKV<SearchResult[]>('search-results', [])
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    domains: [],
    scoreRange: [0, 100],
    dateRange: 'all',
    sortBy: 'relevance'
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Demo search results
  const demoResults: SearchResult[] = [
    {
      id: 'spark-main',
      title: 'Apache Spark - Unified Analytics Engine for Large-Scale Data Processing',
      url: 'https://github.com/apache/spark',
      description: 'Main Apache Spark repository containing the core engine, SQL, streaming, MLlib, and GraphX components',
      type: 'github',
      relevanceScore: 98,
      tags: ['spark-core', 'sql', 'streaming', 'mllib', 'graphx'],
      lastAnalyzed: new Date(Date.now() - 3600000),
      insights: [
        'Primary source for Spark development',
        'Contains comprehensive examples and documentation',
        'Active development with daily commits',
        'Includes all major Spark components'
      ],
      domain: 'github.com'
    },
    {
      id: 'spark-docs',
      title: 'Apache Spark Documentation - Latest Version',
      url: 'https://spark.apache.org/docs/latest/',
      description: 'Official documentation covering programming guides, API references, and deployment instructions',
      type: 'documentation',
      relevanceScore: 95,
      tags: ['documentation', 'api', 'guides', 'deployment'],
      lastAnalyzed: new Date(Date.now() - 7200000),
      insights: [
        'Comprehensive programming guides',
        'Up-to-date API documentation',
        'Deployment and configuration examples',
        'Performance tuning recommendations'
      ],
      domain: 'spark.apache.org'
    },
    {
      id: 'databricks-guide',
      title: 'Databricks Spark Guide - Best Practices and Optimization',
      url: 'https://docs.databricks.com/spark/',
      description: 'Enterprise-focused guide for Spark optimization, best practices, and cloud deployment patterns',
      type: 'documentation',
      relevanceScore: 92,
      tags: ['optimization', 'best-practices', 'databricks', 'cloud'],
      lastAnalyzed: new Date(Date.now() - 1800000),
      insights: [
        'Production optimization techniques',
        'Cloud-specific deployment patterns',
        'Performance monitoring strategies',
        'Enterprise security configurations'
      ],
      domain: 'databricks.com'
    },
    {
      id: 'spark-testing',
      title: 'Spark Testing Base - Unit Testing Framework for Spark',
      url: 'https://github.com/holdenk/spark-testing-base',
      description: 'Testing utilities and framework for Apache Spark applications with ScalaTest and JUnit support',
      type: 'github',
      relevanceScore: 87,
      tags: ['testing', 'scala', 'junit', 'framework'],
      lastAnalyzed: new Date(Date.now() - 5400000),
      insights: [
        'Essential testing patterns for Spark',
        'Unit and integration testing examples',
        'Performance testing utilities',
        'Mock data generation helpers'
      ],
      domain: 'github.com'
    },
    {
      id: 'spark-tutorial',
      title: 'PySpark Tutorial - Complete Guide for Python Developers',
      url: 'https://sparkbyexamples.com/pyspark-tutorial/',
      description: 'Comprehensive PySpark tutorial covering DataFrames, SQL, streaming, and machine learning',
      type: 'website',
      relevanceScore: 83,
      tags: ['pyspark', 'python', 'tutorial', 'dataframes'],
      lastAnalyzed: new Date(Date.now() - 9000000),
      insights: [
        'Practical PySpark examples',
        'Step-by-step tutorials',
        'Real-world use cases',
        'Performance optimization tips'
      ],
      domain: 'sparkbyexamples.com'
    }
  ]

  // Initialize demo data
  useEffect(() => {
    if (searchResults.length === 0) {
      setSearchResults(demoResults)
    }
  }, [])

  // Perform AI-powered search
  const performSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      // Use Spark LLM to enhance search query and find relevant results
      const prompt = spark.llmPrompt`Search for Spark-related sources matching: "${searchQuery}"
      
      Consider these aspects:
      1. Direct keyword matches
      2. Semantic similarity to Spark concepts
      3. Relevance to specific Spark components (Core, SQL, Streaming, MLlib, GraphX)
      4. Educational and practical value
      
      Analyze and rank the available sources based on relevance to this query.`

      const searchAnalysis = await spark.llm(prompt)

      // Filter and sort results based on query and filters
      let filteredResults = demoResults.filter(result => {
        // Text search
        const searchMatch = 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        // Type filter
        const typeMatch = filters.types.length === 0 || filters.types.includes(result.type)

        // Domain filter
        const domainMatch = filters.domains.length === 0 || filters.domains.includes(result.domain)

        // Score filter
        const scoreMatch = result.relevanceScore >= filters.scoreRange[0] && 
                          result.relevanceScore <= filters.scoreRange[1]

        return searchMatch && typeMatch && domainMatch && scoreMatch
      })

      // Sort results
      filteredResults.sort((a, b) => {
        switch (filters.sortBy) {
          case 'relevance':
            return b.relevanceScore - a.relevanceScore
          case 'date':
            return new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime()
          case 'score':
            return b.relevanceScore - a.relevanceScore
          default:
            return 0
        }
      })

      setSearchResults(filteredResults)

    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      types: [],
      domains: [],
      scoreRange: [0, 100],
      dateRange: 'all',
      sortBy: 'relevance'
    })
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'github':
        return <GitBranch className="w-4 h-4 text-purple-500" />
      case 'website':
        return <Globe className="w-4 h-4 text-blue-500" />
      case 'documentation':
        return <FileText className="w-4 h-4 text-green-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-amber-600 bg-amber-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Search Sources</h1>
        <p className="text-muted-foreground mt-1">
          Find relevant Spark resources using AI-powered search
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search for Spark documentation, repositories, tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={performSearch} disabled={isSearching}>
              {isSearching ? (
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              ) : (
                <MagnifyingGlass className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelSimple className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Source Types */}
              <div className="space-y-3">
                <h4 className="font-medium">Source Types</h4>
                <div className="space-y-2">
                  {['github', 'documentation', 'website'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('types', [...filters.types, type])
                          } else {
                            handleFilterChange('types', filters.types.filter(t => t !== type))
                          }
                        }}
                      />
                      <label htmlFor={type} className="text-sm capitalize">
                        {type === 'github' ? 'GitHub' : type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domains */}
              <div className="space-y-3">
                <h4 className="font-medium">Domains</h4>
                <div className="space-y-2">
                  {['github.com', 'spark.apache.org', 'databricks.com'].map(domain => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={domain}
                        checked={filters.domains.includes(domain)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange('domains', [...filters.domains, domain])
                          } else {
                            handleFilterChange('domains', filters.domains.filter(d => d !== domain))
                          }
                        }}
                      />
                      <label htmlFor={domain} className="text-sm font-mono">
                        {domain}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Date Range</h4>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <h4 className="font-medium">Sort By</h4>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="score">Quality Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MagnifyingGlass className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No sources found matching your search.' : 'Enter a search query to find relevant sources.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} sources
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
              <div className="flex items-center gap-2">
                <SortAscending className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Sorted by {filters.sortBy}
                </span>
              </div>
            </div>

            {searchResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(result.type)}
                          <h3 className="font-semibold text-lg">{result.title}</h3>
                          <Badge 
                            className={`text-xs ${getScoreColor(result.relevanceScore)}`}
                          >
                            {result.relevanceScore}% relevance
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{result.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span className="font-mono">{result.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Insights */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Key Insights
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Last analyzed {new Date(result.lastAnalyzed).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Source
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}