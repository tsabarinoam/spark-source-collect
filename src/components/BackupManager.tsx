import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import { 
  Database,
  Download,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  CloudArrowDown,
  CloudArrowUp,
  Archive
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BackupRecord {
  id: string
  timestamp: Date
  size: number // in bytes
  version: string
  components: string[]
  status: 'creating' | 'completed' | 'failed'
  downloadUrl?: string
  description: string
  automatic: boolean
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  lastBackup: Date
  nextScheduled: Date
  retention: number // days
  compressionRatio: number
}

export function BackupManager() {
  // Persistent storage for backup records
  const [backups, setBackups] = useKV<BackupRecord[]>('backup-records', [])
  const [backupStats, setBackupStats] = useKV<BackupStats>('backup-stats', {
    totalBackups: 0,
    totalSize: 0,
    lastBackup: new Date(),
    nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    retention: 30,
    compressionRatio: 0.75
  })

  // Local state for UI
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)

  // Data components that can be backed up
  const backupComponents = [
    { id: 'sources', name: 'Source Collection', essential: true },
    { id: 'tags', name: 'Collaborative Tags', essential: false },
    { id: 'ml-models', name: 'ML Models & Training Data', essential: true },
    { id: 'webhooks', name: 'Webhook Configurations', essential: true },
    { id: 'analytics', name: 'Analytics Data', essential: false },
    { id: 'user-settings', name: 'User Preferences', essential: false },
    { id: 'test-results', name: 'Test Results', essential: false }
  ]

  // Create a comprehensive backup
  const createBackup = async (description: string = '', automatic: boolean = false) => {
    setIsCreatingBackup(true)
    setBackupProgress(0)

    try {
      const backupId = crypto.randomUUID()
      const timestamp = new Date()

      // Create backup record
      const newBackup: BackupRecord = {
        id: backupId,
        timestamp,
        size: 0,
        version: '1.0.0',
        components: backupComponents.map(c => c.id),
        status: 'creating',
        description: description || `${automatic ? 'Automatic' : 'Manual'} backup - ${timestamp.toLocaleDateString()}`,
        automatic
      }

      setBackups(current => [newBackup, ...current])

      // Simulate backup creation process
      const steps = [
        'Initializing backup process...',
        'Collecting source data...',
        'Exporting collaborative tags...',
        'Backing up ML models...',
        'Saving webhook configurations...',
        'Compressing data...',
        'Finalizing backup...'
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setBackupProgress(((i + 1) / steps.length) * 100)
        toast.info(steps[i])
      }

      // Calculate backup size (simulated)
      const backupSize = Math.floor(Math.random() * 50 + 20) * 1024 * 1024 // 20-70 MB

      // Complete backup
      const completedBackup: BackupRecord = {
        ...newBackup,
        status: 'completed',
        size: backupSize,
        downloadUrl: `backup-${backupId}.spark`
      }

      setBackups(current =>
        current.map(b => b.id === backupId ? completedBackup : b)
      )

      // Update stats
      setBackupStats(current => ({
        ...current,
        totalBackups: current.totalBackups + 1,
        totalSize: current.totalSize + backupSize,
        lastBackup: timestamp,
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }))

      toast.success(`Backup created successfully (${formatFileSize(backupSize)})`)

    } catch (error) {
      toast.error('Backup creation failed')
      
      // Mark backup as failed
      setBackups(current =>
        current.map(b => 
          b.status === 'creating' 
            ? { ...b, status: 'failed' }
            : b
        )
      )
    } finally {
      setIsCreatingBackup(false)
      setBackupProgress(0)
    }
  }

  // Restore from backup
  const restoreFromBackup = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) {
      toast.error('Backup not found')
      return
    }

    setIsRestoring(true)

    try {
      // Simulate restore process
      toast.info('Starting restore process...')
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.info('Validating backup integrity...')
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.info('Restoring data components...')
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.success(`Successfully restored from backup created on ${backup.timestamp.toLocaleDateString()}`)

    } catch (error) {
      toast.error('Restore process failed')
    } finally {
      setIsRestoring(false)
    }
  }

  // Download backup file
  const downloadBackup = (backup: BackupRecord) => {
    if (!backup.downloadUrl) {
      toast.error('Download URL not available')
      return
    }

    // Simulate download
    const link = document.createElement('a')
    link.href = '#'
    link.download = backup.downloadUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Backup download started')
  }

  // Delete old backup
  const deleteBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) return

    setBackups(current => current.filter(b => b.id !== backupId))
    setBackupStats(current => ({
      ...current,
      totalBackups: Math.max(0, current.totalBackups - 1),
      totalSize: Math.max(0, current.totalSize - backup.size)
    }))

    toast.success('Backup deleted successfully')
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get backup status badge
  const getStatusBadge = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'creating':
        return <Badge className="bg-blue-100 text-blue-800">Creating</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Backup & Recovery</h1>
        <p className="text-muted-foreground mt-1">
          Protect your Spark Intelligence Platform data with automated backups
        </p>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{backupStats.totalBackups}</div>
            <div className="text-sm text-muted-foreground">Total Backups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{formatFileSize(backupStats.totalSize)}</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{backupStats.retention}</div>
            <div className="text-sm text-muted-foreground">Days Retained</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber">{(backupStats.compressionRatio * 100).toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Compression</div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Backup Controls
          </CardTitle>
          <CardDescription>
            Create and manage backups of your platform data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => createBackup()}
              disabled={isCreatingBackup || isRestoring}
              className="flex-1"
            >
              {isCreatingBackup ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CloudArrowUp className="w-4 h-4 mr-2" />
              )}
              Create Backup
            </Button>
            
            <Button 
              variant="outline"
              disabled={isCreatingBackup || isRestoring || backups.length === 0}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Backup
            </Button>
          </div>

          {/* Backup Progress */}
          {isCreatingBackup && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating backup...</span>
                <span>{backupProgress.toFixed(0)}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
            </div>
          )}

          {/* Restore Progress */}
          {isRestoring && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Restoring from backup...</span>
                <span>Please wait</span>
              </div>
              <Progress value={100} className="h-2 animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Backup History
          </CardTitle>
          <CardDescription>
            View and manage your backup history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No backups created yet</p>
              <p className="text-sm">Create your first backup to protect your data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{backup.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        {backup.timestamp.toLocaleString()} • Version {backup.version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(backup.status)}
                      {backup.automatic && (
                        <Badge variant="outline" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2 font-medium">{formatFileSize(backup.size)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Components:</span>
                      <span className="ml-2 font-medium">{backup.components.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{backup.automatic ? 'Automatic' : 'Manual'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium">{backup.status}</span>
                    </div>
                  </div>

                  {backup.status === 'completed' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadBackup(backup)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreFromBackup(backup.id)}
                        disabled={isRestoring || isCreatingBackup}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBackup(backup.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}

                  {backup.status === 'failed' && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Backup failed - please try creating a new backup</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Components */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Components</CardTitle>
          <CardDescription>
            Data components included in your backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {backupComponents.map((component) => (
              <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{component.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {component.essential ? 'Essential component' : 'Optional component'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Included</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}