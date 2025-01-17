import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom"
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
import {EditProblem} from "@/components/admin/EditProblem.tsx";
import {ProtectedRoute} from "./components/auth/ProtectedRoute.tsx"
import {Auth} from "./pages/Auth.tsx"
import { Home } from "./pages/Home.tsx"
import {useEffect} from 'react'
import axios from 'axios';
import { useAppDispatch,useAppSelector } from '@/redux/hook';
import { setIsAuthenticated,setUser } from '@/redux/slice/authSlice';


function App() {
  const dispatch = useAppDispatch();
  const server_url= import.meta.env.VITE_SERVER_URL;
  const validateToken = async (token: string) => {
      try {
        console.log("called")
        const { data } = await axios.post(`${server_url}/api/auth/validate`, { token });
        if(data){
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(data.user));
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
      }
  };
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        validateToken(token); // Validate the token if it exists
      }
    }, []);
  return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<ProtectedRoute allowedRoles={['Admin','Organiser','User']} />}>
                  <Route path="/problems" element={<ProblemsPage/>} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                  <Route path="/admin" element={<AdminPortal />} />
                </Route>
                <Route path="/" element={<Home />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/problems/:problem_id" element={<CompeteNestProblemPage />} />
                <Route path="/contests" element={<ContestsPage/>} />
                <Route path="/compiler" element={<OnlineCompiler/>} />
                <Route path="/admin" element={<AdminPortal />}>
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="problems" element={<ManageProblems />} />
                    <Route path="problems/add" element={<AddProblem />} />
                    <Route path="problems/edit/:id" element={<EditProblem />} />
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