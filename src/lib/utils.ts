import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatTimer(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateScore(
  answers: { isCorrect: boolean; weight: number }[]
): { score: number; correctCount: number; totalWeight: number } {
  let correctWeight = 0
  let totalWeight = 0
  let correctCount = 0

  for (const answer of answers) {
    totalWeight += answer.weight
    if (answer.isCorrect) {
      correctWeight += answer.weight
      correctCount++
    }
  }

  const score = totalWeight > 0 ? (correctWeight / totalWeight) * 100 : 0
  return { score: Math.round(score * 100) / 100, correctCount, totalWeight }
}

/**
 * Calculates the score based on the formula:
 * Correct: +4
 * Wrong: -1
 * Unanswered: 0
 */
export function calculateTryoutScore(
  answers: { isCorrect: boolean; isAnswered: boolean }[]
): { score: number; correctCount: number; wrongCount: number; unansweredCount: number } {
  let score = 0
  let correctCount = 0
  let wrongCount = 0
  let unansweredCount = 0

  for (const answer of answers) {
    if (!answer.isAnswered) {
      unansweredCount++
    } else if (answer.isCorrect) {
      score += 4
      correctCount++
    } else {
      score -= 1
      wrongCount++
    }
  }

  return { score, correctCount, wrongCount, unansweredCount }
}
