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
  Target
} from '@phosphor-icons/react'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'collector' | 'analytics' | 'search' | 'webhooks' | 'patterns') => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Database,
      badge: null
    },
    {
      id: 'collector',
      label: 'Source Collector',
      icon: Plus,
      badge: null
    },
    {
      id: 'webhooks',
      label: 'GitHub Webhooks',
      icon: Webhook,
      badge: 'Auto'
    },
    {
      id: 'patterns',
      label: 'Discovery Patterns',
      icon: Target,
      badge: 'Smart'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBar,
      badge: null
    },
    {
      id: 'search',
      label: 'Search Sources',
      icon: MagnifyingGlass,
      badge: null
    }
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
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 h-12 ${
                isActive ? 'bg-primary/10 text-primary border-primary/20' : ''
              }`}
              onClick={() => onViewChange(item.id as any)}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
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