import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Timer } from "lucide-react"

interface ContestTimerProps {
  startTime: string
  endTime: string
  timeOffset: number
  onEnd?: () => void
}

export const ContestTimer: React.FC<ContestTimerProps> = ({
  startTime,
  endTime,
  timeOffset,
  onEnd
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now() + timeOffset // Adjust client time with offset
      const start = new Date(startTime).getTime()
      const end = new Date(endTime).getTime()

      // Calculate time remaining
      const targetTime = now < start ? start : end
      const distance = targetTime - now

      if (distance < 0) {
        setTimeRemaining("Contest Ended")
        onEnd?.()
        clearInterval(timer); // Clear the interval here
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      }

      // Calculate progress
      const total = end - start
      const elapsed = now - start
      const calculatedProgress = Math.min(Math.max((elapsed / total) * 100, 0), 100)
      setProgress(calculatedProgress)

      return () => clearInterval(timer);
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, endTime, timeOffset, onEnd])

  const getContestStatus = () => {
    const now = Date.now() + timeOffset
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()

    if (now < start) {
      return { color: "text-yellow-500", text: "Starts In" }
    } else if (now >= start && now < end) {
      return { color: "text-green-500", text: "Ends In" }
    } else {
      return { color: "text-red-500", text: "Ended" }
    }
  }

  const status = getContestStatus()

  return (
    <div className="w-fit space-y-2">
      <div className="font-semibold text-primary flex items-center gap-2">
        <Timer className="w-5 h-5" />
        <span className={status.color}>{status.text}:</span>
        {timeRemaining}
      </div>
      {progress > 0 && progress < 100 && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  )
}