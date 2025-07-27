import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { SourceCollector } from './components/SourceCollector'
import { AnalyticsView } from './components/AnalyticsView'
import { SearchInterface } from './components/SearchInterface'
import { Toaster } from '@/components/ui/sonner'

type View = 'dashboard' | 'collector' | 'analytics' | 'search'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'collector':
        return <SourceCollector />
      case 'analytics':
        return <AnalyticsView />
      case 'search':
        return <SearchInterface />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background font-display">
      <div className="flex h-screen">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App