import { useState, useEffect } from "react"

const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return { days, hours, minutes, seconds }
}

interface ContestTimerProps {
    targetTime: Date | null
    timeOffset: number
    onExpire: () => void
    label: string
}

const ContestTimer: React.FC<ContestTimerProps> = ({ targetTime, timeOffset, onExpire, label }) => {
    if (!targetTime) return null

    const calculateRemainingTime = () => targetTime.getTime() - (Date.now() + timeOffset)
    const [timeRemaining, setTimeRemaining] = useState(calculateRemainingTime())

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = calculateRemainingTime()
            setTimeRemaining(diff)

            if (diff <= 0) {
                clearInterval(interval)
                onExpire()
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [targetTime, timeOffset]) // Only run effect when targetTime changes

    const { days, hours, minutes, seconds } = formatTime(Math.max(0, timeRemaining))

    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <div className="flex justify-center space-x-4">
                {[{ value: days, label: "Days" },
                { value: hours, label: "Hours" },
                { value: minutes, label: "Minutes" },
                { value: seconds, label: "Seconds" }]
                    .map(({ value, label }) => (
                        <div key={label} className="flex flex-col items-center">
                            <div className="text-2xl font-bold bg-primary text-primary-foreground w-14 h-14 rounded-lg flex items-center justify-center mb-1">
                                {value.toString().padStart(2, "0")}
                            </div>
                            <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default ContestTimer
