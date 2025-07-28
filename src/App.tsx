import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { SourceCollector } from './components/SourceCollector'
import { AnalyticsView } from './components/AnalyticsView'
import { SearchInterface } from './components/SearchInterface'
import { WebhookManager } from './components/WebhookManager'
import { WebhookIntegration } from './components/WebhookIntegration'
import { DiscoveryPatterns } from './components/DiscoveryPatterns'
import { RelevanceSettings } from './components/RelevanceSettings'
import { CollaborativeTagging } from './components/CollaborativeTagging'
import { MLRelevanceModels } from './components/MLRelevanceModels'
import { TestingSuite } from './components/TestingSuite'
import { WorkflowTester } from './components/WorkflowTester'
import { BackupManager } from './components/BackupManager'
import { ApacheSparkOrganizationTester } from './components/ApacheSparkOrganizationTester'
import { ComprehensiveTestRunner } from './components/ComprehensiveTestRunner'
import { FinalSystemValidation } from './components/FinalSystemValidation'
import { FinalSystemValidator } from './components/FinalSystemValidator'
import { SparkIntegrationSetup } from './components/SparkIntegrationSetup'
import { SparkApplicationTester } from './components/SparkApplicationTester'
import { SparkNotificationCenter } from './components/SparkNotificationCenter'
import { Toaster } from '@/components/ui/sonner'

type View = 'dashboard' | 'collector' | 'analytics' | 'search' | 'webhooks' | 'patterns' | 'relevance' | 'tagging' | 'ml-models' | 'testing' | 'workflow-testing' | 'backup' | 'apache-spark-org' | 'comprehensive-testing' | 'final-validation' | 'final-validator' | 'spark-setup' | 'spark-testing' | 'spark-notes'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'collector':
        return <SourceCollector />
      case 'webhooks':
        return <WebhookManager />
      case 'patterns':
        return <DiscoveryPatterns />
      case 'relevance':
        return <RelevanceSettings />
      case 'tagging':
        return <CollaborativeTagging />
      case 'ml-models':
        return <MLRelevanceModels />
      case 'testing':
        return <TestingSuite />
      case 'workflow-testing':
        return <WorkflowTester />
      case 'backup':
        return <BackupManager />
      case 'apache-spark-org':
        return <ApacheSparkOrganizationTester />
      case 'comprehensive-testing':
        return <ComprehensiveTestRunner />
      case 'final-validation':
        return <FinalSystemValidation />
      case 'final-validator':
        return <FinalSystemValidator />
      case 'spark-setup':
        return <SparkIntegrationSetup />
      case 'spark-testing':
        return <SparkApplicationTester />
      case 'spark-notes':
        return <SparkNotificationCenter />
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
      {/* Background webhook integration processor */}
      <WebhookIntegration />
      
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