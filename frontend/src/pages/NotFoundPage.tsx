import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export function NotFoundPage({ msg }: { msg?: string }) {
    const navigate = useNavigate()
    const location = useLocation();
    const message = location.state?.errorMessage || msg || "Oops! The page you're looking for doesn't exist.";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-6">
                <FileQuestion className="mx-auto h-24 w-24 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
                <p className="text-xl text-muted-foreground">{message}</p>
                <div className="flex justify-center space-x-4">
                    <Button onClick={() => navigate("/")}>Go to Home</Button>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

