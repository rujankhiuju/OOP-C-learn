import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTasks, deleteTask } from '../api/client'
import type { Task } from '../types'
import { Loader2, CheckCircle, XCircle, Clock, Trash2, FileAudio, FileVideo, Globe } from 'lucide-react'

interface Props {
  selectedId: string | null
  onSelect: (id: string) => void
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-gray-500" />,
  processing: <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  upload: <FileAudio className="w-3 h-3" />,
  url: <Globe className="w-3 h-3" />,
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number | null) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TaskList({ selectedId, onSelect }: Props) {
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getTasks(),
    refetchInterval: (query) => {
      const hasActive = query.state.data?.some(
        (t) => t.status === 'pending' || t.status === 'processing'
      )
      return hasActive ? 2000 : 30000
    },
  })

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteTask(id)
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading...
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 bg-gray-900/30 rounded-xl border border-gray-800">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tasks yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onSelect(task.id)}
          className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
            selectedId === task.id
              ? 'bg-gray-800 border-gray-700 shadow-lg'
              : 'bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/50 hover:border-gray-700'
          }`}
        >
          <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            {STATUS_ICONS[task.status] || <Clock className="w-4 h-4 text-gray-500" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {task.filename}
              </span>
              {task.source_type && (
                <span className="shrink-0 text-gray-600" title={task.source_type}>
                  {SOURCE_ICONS[task.source_type]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className={`text-xs ${
                task.status === 'completed' ? 'text-emerald-500' :
                task.status === 'failed' ? 'text-red-400' :
                task.status === 'processing' ? 'text-indigo-400' :
                'text-gray-600'
              }`}>
                {task.status}
              </span>
              {task.duration && (
                <span className="text-xs text-gray-600">{formatDuration(task.duration)}</span>
              )}
              {task.detected_language && (
                <span className="text-xs text-gray-600 uppercase">{task.detected_language}</span>
              )}
              <span className="text-xs text-gray-700 ml-auto">{formatTime(task.created_at)}</span>
            </div>
            {task.status === 'processing' && (
              <div className="mt-2 w-full bg-gray-800 rounded-full h-1">
                <div
                  className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}
            {task.status === 'failed' && task.error && (
              <p className="text-xs text-red-400/80 mt-1 truncate">{task.error}</p>
            )}
          </div>

          <button
            onClick={(e) => handleDelete(e, task.id)}
            className="shrink-0 p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
