import { useQuery } from '@tanstack/react-query'
import { getResult } from '../api/client'
import ExportButtons from './ExportButtons'
import { Loader2, AlertCircle, Languages, Clock, User } from 'lucide-react'

interface Props {
  taskId: string | null
}

function formatTs(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

export default function TranscriptView({ taskId }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['result', taskId],
    queryFn: () => getResult(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'completed') return false
      return 2000
    },
  })

  if (!taskId) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600 bg-gray-900/30 rounded-xl border border-gray-800">
        <div className="text-center">
          <Languages className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Select a task to view its transcript</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading transcript...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3 border border-red-400/20">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error instanceof Error ? error.message : 'Failed to load transcript'}
      </div>
    )
  }

  if (!data) return null

  if (data.status === 'processing' || data.status === 'pending') {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="text-sm text-gray-400">Processing...</p>
        </div>
      </div>
    )
  }

  if (data.segments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600 bg-gray-900/30 rounded-xl border border-gray-800">
        <p className="text-sm">No transcript segments found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {data.detected_language && (
            <span className="flex items-center gap-1">
              <Languages className="w-3 h-3" />
              {data.detected_language.toUpperCase()}
            </span>
          )}
          {data.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(data.duration / 60)}:{(data.duration % 60).toFixed(0).padStart(2, '0')}
            </span>
          )}
          <span className="text-gray-700">{data.segments.length} segments</span>
        </div>
        <ExportButtons taskId={taskId} />
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto scrollbar-thin">
        {data.segments.map((seg, i) => (
          <div key={i} className="p-3 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-start gap-3">
              <span className="shrink-0 text-xs text-gray-600 font-mono mt-0.5 min-w-[70px]">
                {formatTs(seg.start)}
              </span>
              <div className="flex-1 min-w-0">
                {seg.speaker && (
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-400 mb-1">
                    <User className="w-3 h-3" />
                    {seg.speaker}
                  </span>
                )}
                <p className="text-sm text-gray-200 leading-relaxed">{seg.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
