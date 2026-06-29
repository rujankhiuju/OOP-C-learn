import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link, Loader2, CheckCircle, AlertCircle, FileAudio, FileVideo } from 'lucide-react'
import { uploadFile, transcribeUrl } from '../api/client'

interface Props {
  onTaskCreated: (taskId: string) => void
}

type Mode = 'upload' | 'url'

export default function UploadZone({ onTaskCreated }: Props) {
  const [mode, setMode] = useState<Mode>('upload')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const task = await uploadFile(file)
      setSuccess(true)
      onTaskCreated(task.id)
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }, [onTaskCreated])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.opus', '.wma'],
      'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'],
    },
    disabled: loading,
  })

  const handleUrlSubmit = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const task = await transcribeUrl(url.trim())
      setSuccess(true)
      setUrl('')
      onTaskCreated(task.id)
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Failed to process URL')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('upload'); setError(null); setSuccess(false) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => { setMode('url'); setError(null); setSuccess(false) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Link className="w-4 h-4" />
          URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
          } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            ) : (
              <div className="flex gap-2">
                <FileAudio className="w-12 h-12 text-gray-600" />
                <FileVideo className="w-12 h-12 text-gray-600" />
              </div>
            )}
            {isDragActive ? (
              <p className="text-indigo-400 font-medium">Drop your file here...</p>
            ) : (
              <>
                <p className="text-gray-400 font-medium">
                  Drag & drop an audio or video file
                </p>
                <p className="text-gray-600 text-sm">
                  MP3, WAV, MP4, MKV, MOV + more — up to 500MB
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-full">
                  <Upload className="w-3 h-3" />
                  Browse files
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a video or audio URL (YouTube, direct MP4, etc.)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link className="w-4 h-4" />
            )}
            Transcribe
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-3 border border-red-400/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && !error && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 rounded-lg px-4 py-3 border border-emerald-400/20">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Task created successfully
        </div>
      )}
    </div>
  )
}
