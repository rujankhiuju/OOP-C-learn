import { useState } from 'react'
import UploadZone from './components/UploadZone'
import TaskList from './components/TaskList'
import TranscriptView from './components/TranscriptView'

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
              AT
            </div>
            <h1 className="text-xl font-bold">Audio Transcriber</h1>
          </div>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            faster-whisper large-v3
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <UploadZone onTaskCreated={(id) => {
          setSelectedTaskId(id)
        }} />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              Tasks
            </h2>
            <TaskList
              selectedId={selectedTaskId}
              onSelect={setSelectedTaskId}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block" />
              Transcript
            </h2>
            <TranscriptView taskId={selectedTaskId} />
          </div>
        </div>
      </main>
    </div>
  )
}
