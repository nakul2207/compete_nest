import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { Header } from "./components/Header"
import { CompeteNestProblemPage } from "./pages/CompeteNestProblemPage"
import { ProblemsPage } from "./pages/ProblemsPage"
import { ContestsPage } from "./pages/ContestsPage"
import { AdminPortal } from "@/components/AdminPortal.tsx"
import { ManageUsers } from "./components/admin/ManageUsers.tsx";
import { AddProblem } from "./components/admin/AddProblem.tsx";
import { ManageProblems } from "./components/admin/ManageProblems.tsx"
import { ManageContests } from "@/components/admin/ManageContests.tsx";
import { ManageCompanies } from "@/components/admin/ManageCompanies.tsx";
import { ManageTopics } from "@/components/admin/ManageTopics.tsx";
import { OnlineCompiler } from "@/components/OnlineCompiler.tsx"
import { EditProblem } from "@/components/admin/EditProblem.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx"
import { Auth } from "./pages/Auth.tsx"
import { HomePage } from "./pages/HomePage.tsx"
import { useEffect } from 'react'
import { useAppDispatch } from '@/redux/hook';
import { setIsAuthenticated, setUser } from '@/redux/slice/authSlice';
import { AddContest } from "@/components/admin/AddContest.tsx";
import { ValidateToken } from "@/api/authApi.ts";
import { ForbiddenPage } from "@/pages/ForbiddenPage.tsx";
import { NotFoundPage } from "@/pages/NotFoundPage.tsx";
import { Loader } from "./components/Loader.tsx"
import Contest from "./pages/Contest.tsx"
import { LeaderBoard } from "./components/LeaderBoard.tsx"
import ProfilePage from "./pages/Profile.tsx"
import { SettingsPage } from "./pages/SettingsPage.tsx"

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    ValidateToken().then((data) => {
      if (data) {
        dispatch(setIsAuthenticated(true));
        dispatch(setUser(data.user));
      }
    }).catch((err) => {
      console.error('Token validation failed:', err);
    })
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              {/* <Route element={<ProtectedRoute allowedRoles={['Admin','Organiser','User']} />}>
                  <Route path="/problems" element={<ProblemsPage/>} />
                </Route> */}
              <Route element={<ProtectedRoute allowedRoles={['Organiser', 'Admin']} />}>
                <Route path="/dashboard" element={<AdminPortal />}>
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="problems" element={<ManageProblems />} />
                  <Route path="problems/add" element={<AddProblem />} />
                  <Route path="problems/edit/:id" element={<EditProblem />} />
                  <Route path="contests" element={<ManageContests />} />
                  <Route path="contests/add" element={<AddContest />} />
                  <Route path="companies" element={<ManageCompanies />} />
                  <Route path="topics" element={<ManageTopics />} />
                </Route>
              </Route>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:user_id" element={<ProfilePage />} />
              <Route path="/settings/:user_id" element={<SettingsPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problems/:problem_id" element={<CompeteNestProblemPage />} />
              <Route element={<ProtectedRoute allowedRoles={['User', 'Organiser', 'Admin']} />}>
                <Route path="/contests" element={<ContestsPage />} />
                <Route path="/contest/:contest_id" element={<Contest />} />
                <Route path="/contest/:contest_id/problem/:problem_id" element={<CompeteNestProblemPage />} />
                <Route path="/contest/:contest_id/leaderboard" element={<LeaderBoard />} />
              </Route>
              <Route path="/compiler" element={<OnlineCompiler />} />

              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/loader" element={<Loader />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App