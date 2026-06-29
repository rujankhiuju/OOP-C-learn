import axios from 'axios'
import type { Task, TranscriptResult } from '../types'

const api = axios.create({
  baseURL: '/api',
})

export async function uploadFile(file: File): Promise<Task> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<Task>('/transcribe', form)
  return data
}

export async function transcribeUrl(url: string): Promise<Task> {
  const { data } = await api.post<Task>('/transcribe-url', { url })
  return data
}

export async function getTasks(status?: string): Promise<Task[]> {
  const params = status ? { status } : {}
  const { data } = await api.get<Task[]>('/tasks', { params })
  return data
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await api.get<Task>(`/tasks/${id}`)
  return data
}

export async function getResult(id: string): Promise<TranscriptResult> {
  const { data } = await api.get<TranscriptResult>(`/tasks/${id}/result`)
  return data
}

export function getDownloadUrl(id: string, format: 'txt' | 'srt' | 'json'): string {
  return `/api/tasks/${id}/download/${format}`
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
