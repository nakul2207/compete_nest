import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { Header } from "./components/Header"
import { CompeteNestProblemPage } from "./pages/CompeteNestProblemPage"
import { ProblemsPage } from "./pages/ProblemsPage"
import { ContestsPage } from "./pages/ContestsPage"
import {AdminPortal} from "@/components/AdminPortal.tsx"
import {ManageUsers} from "./components/admin/ManageUsers.tsx";
import {AddProblem} from "./components/admin/AddProblem.tsx";
import {ManageProblems} from "./components/admin/ManageProblems.tsx"
import {ManageContests} from "@/components/admin/ManageContests.tsx";
import {ManageCompanies} from "@/components/admin/ManageCompanies.tsx";
import {ManageTopics} from "@/components/admin/ManageTopics.tsx";
import {OnlineCompiler} from "@/components/OnlineCompiler.tsx"

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
                  <Route path="/problems/:problem_id" element={<CompeteNestProblemPage />} />
                <Route path="/contests" element={<ContestsPage/>} />
                <Route path="/compiler" element={<OnlineCompiler/>} />
                  <Route path="/admin" element={<AdminPortal />}>
                      <Route path="users" element={<ManageUsers />} />
                      <Route path="problems" element={<ManageProblems />} />
                      <Route path="problems/add" element={<AddProblem />} />
                      <Route path="problems/edit/:id" element={<AddProblem />} />
                      <Route path="contests" element={<ManageContests />} />
                      <Route path="companies" element={<ManageCompanies />} />
                      <Route path="topics" element={<ManageTopics />} />
                  </Route>
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
  )
}

export default App