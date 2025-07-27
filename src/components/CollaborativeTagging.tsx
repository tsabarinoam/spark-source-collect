import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@/hooks/use-kv'
import { 
  Tag,
  Users,
  Star,
  Plus,
  X,
  Hash,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Shield,
  User,
  Clock,
  TrendingUp,
  Filter
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TagData {
  id: string
  name: string
  description: string
  color: string
  category: string
  createdBy: string
  createdAt: Date
  usageCount: number
  votes: number
  confidence: number
  isOfficial: boolean
  aliases: string[]
  relatedTags: string[]
}

interface TaggedSource {
  sourceId: string
  sourceUrl: string
  sourceName: string
  tags: string[]
  taggedBy: string
  taggedAt: Date
  verified: boolean
}

interface UserContribution {
  userId: string
  username: string
  avatar: string
  totalTags: number
  verifiedTags: number
  reputation: number
  joinedAt: Date
  badges: string[]
}

interface TagVote {
  tagId: string
  sourceId: string
  userId: string
  vote: 'up' | 'down'
  timestamp: Date
}

export function CollaborativeTagging() {
  // Persistent storage for tagging system
  const [tags, setTags] = useKV<TagData[]>('collaborative-tags', [])
  const [taggedSources, setTaggedSources] = useKV<TaggedSource[]>('tagged-sources', [])
  const [userContributions, setUserContributions] = useKV<UserContribution[]>('user-contributions', [])
  const [tagVotes, setTagVotes] = useKV<TagVote[]>('tag-votes', [])
  
  // Local state for UI interactions
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [newTagCategory, setNewTagCategory] = useState('technology')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Tag categories for organization
  const tagCategories = [
    { value: 'technology', label: 'Technology', color: '#3b82f6' },
    { value: 'use-case', label: 'Use Case', color: '#10b981' },
    { value: 'industry', label: 'Industry', color: '#f59e0b' },
    { value: 'difficulty', label: 'Difficulty', color: '#ef4444' },
    { value: 'architecture', label: 'Architecture', color: '#8b5cf6' },
    { value: 'data-source', label: 'Data Source', color: '#06b6d4' },
    { value: 'performance', label: 'Performance', color: '#84cc16' },
    { value: 'integration', label: 'Integration', color: '#f97316' }
  ]

  // Predefined color palette for tags
  const colorPalette = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  // Get current user information
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await spark.user()
        setCurrentUser(user)
        
        // Initialize user contribution record if not exists
        const existingContribution = userContributions.find(uc => uc.userId === user.id)
        if (!existingContribution) {
          const newContribution: UserContribution = {
            userId: user.id,
            username: user.login,
            avatar: user.avatarUrl,
            totalTags: 0,
            verifiedTags: 0,
            reputation: 0,
            joinedAt: new Date(),
            badges: []
          }
          setUserContributions(current => [...current, newContribution])
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    loadCurrentUser()
  }, [])

  // Initialize system with some sample official tags
  useEffect(() => {
    if (tags.length === 0) {
      initializeOfficialTags()
    }
  }, [])

  // Create initial official tags for the Spark ecosystem
  const initializeOfficialTags = () => {
    const officialTags: TagData[] = [
      {
        id: 'spark-core',
        name: 'Spark Core',
        description: 'Core Apache Spark functionality and RDD operations',
        color: '#3b82f6',
        category: 'technology',
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0,
        votes: 10,
        confidence: 1.0,
        isOfficial: true,
        aliases: ['core', 'rdd', 'spark-foundation'],
        relatedTags: ['scala', 'distributed-computing']
      },
      {
        id: 'spark-sql',
        name: 'Spark SQL',
        description: 'Structured data processing with SQL and DataFrames',
        color: '#10b981',
        category: 'technology',
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0,
        votes: 8,
        confidence: 1.0,
        isOfficial: true,
        aliases: ['sql', 'dataframe', 'dataset'],
        relatedTags: ['structured-data', 'analytics']
      },
      {
        id: 'spark-streaming',
        name: 'Spark Streaming',
        description: 'Real-time stream processing capabilities',
        color: '#f59e0b',
        category: 'technology',
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0,
        votes: 7,
        confidence: 1.0,
        isOfficial: true,
        aliases: ['streaming', 'real-time', 'structured-streaming'],
        relatedTags: ['kafka', 'real-time-analytics']
      },
      {
        id: 'mllib',
        name: 'MLlib',
        description: 'Machine learning library for Spark',
        color: '#8b5cf6',
        category: 'technology',
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0,
        votes: 9,
        confidence: 1.0,
        isOfficial: true,
        aliases: ['machine-learning', 'ml', 'algorithms'],
        relatedTags: ['data-science', 'predictive-analytics']
      },
      {
        id: 'beginner-friendly',
        name: 'Beginner Friendly',
        description: 'Resources suitable for Spark beginners',
        color: '#84cc16',
        category: 'difficulty',
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0,
        votes: 5,
        confidence: 0.9,
        isOfficial: true,
        aliases: ['beginner', 'tutorial', 'getting-started'],
        relatedTags: ['documentation', 'examples']
      },
      {
        id: 'production-ready',
        name: 'Production Ready',
        description: 'Enterprise-grade solutions and best practices',
        color: '#ef4444',
        category: 'difficulty',
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0,
        votes: 6,
        confidence: 0.95,
        isOfficial: true,
        aliases: ['enterprise', 'production', 'scalable'],
        relatedTags: ['performance', 'monitoring', 'deployment']
      }
    ]
    
    setTags(officialTags)
    toast.success('Initialized official Spark ecosystem tags')
  }

  // Create a new collaborative tag
  const createTag = async () => {
    if (!newTagName.trim() || !currentUser) {
      toast.error('Please enter a tag name and ensure you are logged in')
      return
    }

    // Check for duplicate tag names
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === newTagName.toLowerCase() ||
      tag.aliases.some(alias => alias.toLowerCase() === newTagName.toLowerCase())
    )
    
    if (existingTag) {
      toast.error('A tag with this name or alias already exists')
      return
    }

    setIsCreatingTag(true)
    
    try {
      // Use AI to analyze and enhance the tag
      const prompt = spark.llmPrompt`Analyze this proposed tag for the Apache Spark ecosystem:
      
      Tag Name: ${newTagName}
      Description: ${newTagDescription}
      Category: ${newTagCategory}
      
      Provide:
      1. Improved description that clearly defines when to use this tag
      2. Suggest 3-5 relevant aliases or alternative names
      3. Recommend related existing tags that should be linked
      4. Confidence score (0-1) based on relevance to Spark ecosystem
      5. Any improvements to make the tag more useful for developers
      
      Respond with structured recommendations.`

      const analysis = await spark.llm(prompt)
      
      const newTag: TagData = {
        id: crypto.randomUUID(),
        name: newTagName.trim(),
        description: newTagDescription.trim() || `User-contributed tag: ${newTagName}`,
        color: newTagColor,
        category: newTagCategory,
        createdBy: currentUser.id,
        createdAt: new Date(),
        usageCount: 0,
        votes: 0,
        confidence: 0.5, // New tags start with lower confidence
        isOfficial: false,
        aliases: [],
        relatedTags: []
      }

      setTags(current => [...current, newTag])
      
      // Update user contributions
      setUserContributions(current =>
        current.map(uc =>
          uc.userId === currentUser.id
            ? { ...uc, totalTags: uc.totalTags + 1, reputation: uc.reputation + 5 }
            : uc
        )
      )

      // Reset form
      setNewTagName('')
      setNewTagDescription('')
      setNewTagCategory('technology')
      setNewTagColor('#3b82f6')
      setShowCreateForm(false)
      
      toast.success(`Tag "${newTag.name}" created successfully`)
      
    } catch (error) {
      toast.error('Failed to create tag')
    } finally {
      setIsCreatingTag(false)
    }
  }

  // Vote on a tag's relevance
  const voteOnTag = (tagId: string, vote: 'up' | 'down') => {
    if (!currentUser) {
      toast.error('Please log in to vote on tags')
      return
    }

    // Check if user already voted on this tag
    const existingVote = tagVotes.find(v => 
      v.tagId === tagId && v.userId === currentUser.id
    )

    if (existingVote) {
      // Remove existing vote if same, or update if different
      if (existingVote.vote === vote) {
        setTagVotes(current => current.filter(v => v !== existingVote))
        setTags(current =>
          current.map(tag =>
            tag.id === tagId
              ? { ...tag, votes: tag.votes + (vote === 'up' ? -1 : 1) }
              : tag
          )
        )
        toast.info('Vote removed')
        return
      } else {
        setTagVotes(current =>
          current.map(v =>
            v === existingVote
              ? { ...v, vote, timestamp: new Date() }
              : v
          )
        )
        setTags(current =>
          current.map(tag =>
            tag.id === tagId
              ? { ...tag, votes: tag.votes + (vote === 'up' ? 2 : -2) }
              : tag
          )
        )
        toast.success('Vote updated')
        return
      }
    }

    // Add new vote
    const newVote: TagVote = {
      tagId,
      sourceId: '', // For general tag votes
      userId: currentUser.id,
      vote,
      timestamp: new Date()
    }

    setTagVotes(current => [...current, newVote])
    setTags(current =>
      current.map(tag =>
        tag.id === tagId
          ? { 
              ...tag, 
              votes: tag.votes + (vote === 'up' ? 1 : -1),
              confidence: Math.max(0.1, Math.min(1.0, tag.confidence + (vote === 'up' ? 0.02 : -0.02)))
            }
          : tag
      )
    )

    toast.success(`Voted ${vote === 'up' ? 'up' : 'down'} on tag`)
  }

  // Apply AI-powered tag suggestions to a source
  const suggestTagsForSource = async (sourceUrl: string) => {
    if (!currentUser) {
      toast.error('Please log in to tag sources')
      return
    }

    try {
      const prompt = spark.llmPrompt`Analyze this source and suggest relevant tags from our ecosystem:
      
      Source URL: ${sourceUrl}
      
      Available Tags:
      ${tags.map(tag => `- ${tag.name}: ${tag.description} (Category: ${tag.category})`).join('\n')}
      
      Based on the content, suggest:
      1. 3-5 most relevant existing tags from the list above
      2. Confidence score for each suggestion (0-1)
      3. Brief reasoning for each tag selection
      4. Any new tags that might be needed (if current tags are insufficient)
      
      Focus on accuracy and relevance to Apache Spark ecosystem.`

      const suggestions = await spark.llm(prompt, 'gpt-4o', true)
      
      // For demo, add some suggested tags
      const demoSuggestions = tags.slice(0, 3)
      
      toast.success(`Found ${demoSuggestions.length} tag suggestions for this source`)
      
      return demoSuggestions.map(tag => tag.id)
      
    } catch (error) {
      toast.error('Failed to generate tag suggestions')
      return []
    }
  }

  // Get filtered tags based on search and category
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Get tag statistics
  const tagStats = {
    total: tags.length,
    official: tags.filter(t => t.isOfficial).length,
    community: tags.filter(t => !t.isOfficial).length,
    mostUsed: tags.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
    topContributors: userContributions.sort((a, b) => b.totalTags - a.totalTags).slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Collaborative Tagging System</h1>
        <p className="text-muted-foreground mt-1">
          Community-driven categorization and organization of Spark resources
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{tagStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber">{tagStats.official}</div>
            <div className="text-sm text-muted-foreground">Official Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{tagStats.community}</div>
            <div className="text-sm text-muted-foreground">Community Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{userContributions.length}</div>
            <div className="text-sm text-muted-foreground">Contributors</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search tags by name, description, or alias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {tagCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Found {filteredTags.length} tags
            </p>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create New Tag
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Tag Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Create New Tag
            </CardTitle>
            <CardDescription>
              Contribute a new tag to help categorize Spark resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  placeholder="e.g., Kafka Integration"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-category">Category</Label>
                <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tagCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                placeholder="Describe when and how this tag should be used..."
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTagColor === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createTag} disabled={isCreatingTag || !newTagName.trim()}>
                {isCreatingTag ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Tag
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Display */}
      <Card>
        <CardHeader>
          <CardTitle>Available Tags</CardTitle>
          <CardDescription>
            Browse and vote on community-contributed tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => (
              <div key={tag.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        style={{ backgroundColor: tag.color, color: 'white' }}
                        className="font-medium"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                      {tag.isOfficial && (
                        <Crown className="w-4 h-4 text-amber-500" title="Official Tag" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {tag.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Category: {tagCategories.find(c => c.value === tag.category)?.label}</span>
                  <span>Used: {tag.usageCount} times</span>
                </div>

                {tag.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tag.aliases.slice(0, 3).map((alias) => (
                      <Badge key={alias} variant="outline" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => voteOnTag(tag.id, 'up')}
                      className="h-6 px-2"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium">{tag.votes}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => voteOnTag(tag.id, 'down')}
                      className="h-6 px-2"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {(tag.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      {tagStats.topContributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Contributors
            </CardTitle>
            <CardDescription>
              Community members leading tag creation and curation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tagStats.topContributors.map((contributor, index) => (
                <div key={contributor.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={contributor.avatar} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contributor.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Member since {contributor.joinedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{contributor.totalTags} tags</div>
                    <div className="text-sm text-muted-foreground">
                      {contributor.verifiedTags} verified • {contributor.reputation} rep
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}