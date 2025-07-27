import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Plus, 
  ChartBar, 
  MagnifyingGlass,
  Sparkles,
  GitBranch,
  Webhook,
  Target,
  Sliders,
  Tag,
  Brain,
  TestTube,
  Shield
} from '@phosphor-icons/react'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'collector' | 'analytics' | 'search' | 'webhooks' | 'patterns' | 'relevance' | 'tagging' | 'ml-models' | 'testing' | 'backup') => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Database,
      badge: null,
      section: 'main'
    },
    {
      id: 'collector',
      label: 'Source Collector',
      icon: Plus,
      badge: null,
      section: 'main'
    },
    {
      id: 'webhooks',
      label: 'GitHub Webhooks',
      icon: Webhook,
      badge: 'Auto',
      section: 'automation'
    },
    {
      id: 'patterns',
      label: 'Discovery Patterns',
      icon: Target,
      badge: 'Smart',
      section: 'automation'
    },
    {
      id: 'relevance',
      label: 'Relevance Settings',
      icon: Sliders,
      badge: 'AI',
      section: 'automation'
    },
    {
      id: 'tagging',
      label: 'Collaborative Tags',
      icon: Tag,
      badge: 'Community',
      section: 'intelligence'
    },
    {
      id: 'ml-models',
      label: 'ML Models',
      icon: Brain,
      badge: 'Advanced',
      section: 'intelligence'
    },
    {
      id: 'testing',
      label: 'Testing Suite',
      icon: TestTube,
      badge: 'QA',
      section: 'system'
    },
    {
      id: 'backup',
      label: 'Backup & Recovery',
      icon: Shield,
      badge: 'Safe',
      section: 'system'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBar,
      badge: null,
      section: 'insights'
    },
    {
      id: 'search',
      label: 'Search Sources',
      icon: MagnifyingGlass,
      badge: null,
      section: 'insights'
    }
  ]

  const sections = [
    { id: 'main', label: 'Core Features' },
    { id: 'automation', label: 'Automation' },
    { id: 'intelligence', label: 'AI Intelligence' },
    { id: 'system', label: 'System' },
    { id: 'insights', label: 'Analytics' }
  ]

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Spark Intelligence</h1>
            <p className="text-sm text-muted-foreground">Source Discovery Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              {section.label}
            </h3>
            <div className="space-y-1">
              {menuItems
                .filter(item => item.section === section.id)
                .map((item) => {
                  const Icon = item.icon
                  const isActive = currentView === item.id
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 h-10 ${
                        isActive ? 'bg-primary/10 text-primary border-primary/20' : ''
                      }`}
                      onClick={() => onViewChange(item.id as any)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GitBranch className="w-4 h-4" />
          <span>Connected to Spark AI</span>
        </div>
      </div>
    </div>
  )
}