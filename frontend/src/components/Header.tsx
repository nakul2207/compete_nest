import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "./ui/button"
import { Moon, Sun, User, Menu } from 'lucide-react'
import { useTheme } from "./ThemeProvider.tsx"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src="/logo.svg" alt="Compete Nest Logo" className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Compete Nest
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link>
            <Link to="/problems" className="transition-colors hover:text-foreground/80 text-foreground">Problems</Link>
            <Link to="/contests" className="transition-colors hover:text-foreground/80 text-foreground">Contests</Link>
            <Link to="/discuss" className="transition-colors hover:text-foreground/80 text-foreground">Discuss</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" className="mr-2">
            <User className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">User profile</span>
          </Button>
          <Button variant="outline" className="mr-2">
            Log in
          </Button>
          <Button>Sign up</Button>
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
            <li><Link to="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link></li>
            <li><Link to="/problems" className="transition-colors hover:text-foreground/80 text-foreground">Problems</Link></li>
            <li><Link to="/contests" className="transition-colors hover:text-foreground/80 text-foreground">Contests</Link></li>
            <li><Link to="/discuss" className="transition-colors hover:text-foreground/80 text-foreground">Discuss</Link></li>
          </ul>
        </nav>
      )}
    </header>
  )
}