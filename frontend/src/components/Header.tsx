import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Moon, Sun, User, Menu, X, LogOut } from "lucide-react"
import { useTheme } from "./ThemeProvider.tsx"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { setIsLoginPage } from "@/redux/slice/toggleSlice.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutUser } from "@/api/authApi.ts"
import { logout } from "@/redux/slice/authSlice.tsx"
import { motion } from "framer-motion"
import Competenest_dark from "../../public/logo/Competenest_dark.png";
import Competenest_light from "../../public/logo/Competenest_light.png";

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const username = user?.email.split("@")[0]

  const handleLogout = async () => {
    await LogoutUser()
    dispatch(logout())
    navigate("/auth")
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - visible on all screen sizes */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center">
              <img
                src={theme === 'light' ? Competenest_light : Competenest_dark}
                alt="CompeteNest"
                className="h-10 md:h-12"
              />
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated && user && (user.role === "Organiser" || user.role === "Admin") && (
            <NavLink to="/dashboard" isActive={isActive("/dashboard")}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/problems" isActive={isActive("/problems")}>
            Problems
          </NavLink>
          <NavLink to="/contests" isActive={isActive("/contests")}>
            Contests
          </NavLink>
          <NavLink to="/compiler" isActive={isActive("/compiler")}>
            Compiler
          </NavLink>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>

          {/* User menu or auth buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">User profile</span>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/profile/${username}`)} className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/settings/${username}`)} className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    dispatch(setIsLoginPage(true))
                    navigate("/auth")
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                >
                  Log in
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    dispatch(setIsLoginPage(false))
                    navigate("/auth")
                  }}
                  size="sm"
                  className="rounded-full px-4"
                >
                  Sign up
                </Button>
              </motion.div>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-[1.2rem] w-[1.2rem]" /> : <Menu className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t"
        >
          <div className="flex flex-col space-y-3 p-4">
            {isAuthenticated && user && (user.role === "Organiser" || user.role === "Admin") && (
              <MobileNavLink to="/dashboard" isActive={isActive("/dashboard")}>
                Dashboard
              </MobileNavLink>
            )}
            <MobileNavLink to="/problems" isActive={isActive("/problems")}>
              Problems
            </MobileNavLink>
            <MobileNavLink to="/contests" isActive={isActive("/contests")}>
              Contests
            </MobileNavLink>
            <MobileNavLink to="/compiler" isActive={isActive("/compiler")}>
              Compiler
            </MobileNavLink>
          </div>
        </motion.nav>
      )}
    </header>
  )
}

// Desktop Navigation Link Component
function NavLink({ to, isActive, children }: { to: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className="relative px-3 py-2 rounded-md text-sm font-medium transition-colors">
      <span className={`${isActive ? "text-primary" : "text-foreground hover:text-primary/90"}`}>{children}</span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  )
}

// Mobile Navigation Link Component
function MobileNavLink({ to, isActive, children }: { to: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-base font-medium transition-all ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted hover:text-primary/90"
        }`}
    >
      {children}
    </Link>
  )
}