import { getDownloadUrl } from '../api/client'
import { FileText, Subtitles, Code, Download } from 'lucide-react'

interface Props {
  taskId: string
}

const FORMATS = [
  { key: 'txt' as const, label: 'TXT', icon: FileText, desc: 'Plain text with timestamps' },
  { key: 'srt' as const, label: 'SRT', icon: Subtitles, desc: 'Subtitle format' },
  { key: 'json' as const, label: 'JSON', icon: Code, desc: 'Structured data' },
]

export default function ExportButtons({ taskId }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {FORMATS.map(({ key, label, icon: Icon, desc }) => (
        <a
          key={key}
          href={getDownloadUrl(taskId, key)}
          download
          className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 hover:text-gray-200 transition-all"
          title={desc}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
          <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  )
}
