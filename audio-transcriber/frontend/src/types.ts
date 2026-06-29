export interface Task {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  filename: string
  media_type: string | null
  duration: number | null
  detected_language: string | null
  progress: number
  error: string | null
  source_type: string | null
  source_url: string | null
  created_at: string
  completed_at: string | null
}

export interface Segment {
  start: number
  end: number
  text: string
  speaker: string | null
  words?: { word: string; start: number; end: number; probability: number }[]
}

export interface TranscriptResult {
  task_id: string
  status: string
  filename: string
  duration: number | null
  detected_language: string | null
  segments: Segment[]
  text: string
}
