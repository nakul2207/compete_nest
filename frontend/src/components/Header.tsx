import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Moon, Sun, User, Menu, LogOut } from "lucide-react"
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
import {LogoutUser} from "@/api/authApi.ts";
import {logout} from "@/redux/slice/authSlice.tsx";

export function Header() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const username = user?.email.split('@')[0];

  const handleLogout = async () => {
    await LogoutUser();
    dispatch(logout());
    navigate("/auth");
  }

  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">CompeteNest</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground">
                Home
              </Link>
              <Link to="/problems" className="transition-colors hover:text-foreground/80 text-foreground">
                Problems
              </Link>
              <Link to="/contests" className="transition-colors hover:text-foreground/80 text-foreground">
                Contests
              </Link>
              {isAuthenticated && user && (user.role === "Organiser" || user.role === "Admin") && (
                  <Link to="/admin" className="transition-colors hover:text-foreground/80 text-foreground">
                    Admin
                  </Link>
              )}
              <Link to="/compiler" className="transition-colors hover:text-foreground/80 text-foreground">
                Compiler
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <User className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">User profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/profile/${username}`)} className="cursor-pointer">Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/settings/${username}`)} className="cursor-pointer">Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="h-3 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                  <Button
                      onClick={() => {
                        dispatch(setIsLoginPage(true))
                        navigate("/auth")
                      }}
                      variant="outline"
                      className="mr-2"
                  >
                    Log in
                  </Button>
                  <Button
                      onClick={() => {
                        dispatch(setIsLoginPage(false))
                        navigate("/auth")
                      }}
                  >
                    Sign up
                  </Button>
                </>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {isMobileMenuOpen && (
            <nav className="md:hidden border-t p-4">
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/problems" className="transition-colors hover:text-foreground/80 text-foreground">
                    Problems
                  </Link>
                </li>
                <li>
                  <Link to="/contests" className="transition-colors hover:text-foreground/80 text-foreground">
                    Contests
                  </Link>
                </li>
                {isAuthenticated && user && (user.role === "Organiser" || user.role === "Admin") && (
                    <li>
                      <Link to="/admin" className="transition-colors hover:text-foreground/80 text-foreground">
                        Admin
                      </Link>
                    </li>
                )}
              </ul>
            </nav>
        )}
      </header>
  )
}

