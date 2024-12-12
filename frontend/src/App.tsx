import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { Header } from "./components/Header"
import { CompeteNestProblemPage } from "./pages/CompeteNestProblemPage"
import { ProblemsPage } from "./pages/ProblemsPage"
import { ContestsPage } from "./pages/ContestsPage"

function App() {
  return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<CompeteNestProblemPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/contests" element={<ContestsPage/>} />
                {/* Add more routes as needed */}
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
  )
}

export default App