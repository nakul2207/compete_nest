import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, FileText, Trophy, Building, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import {getAllTopics} from "@/api/topicApi.ts";
import {setTopics} from "@/redux/slice/topicSlice.tsx";
import {getAllCompanies} from "@/api/companyApi.ts";
import {setCompanies} from "@/redux/slice/companySlice.tsx";
import {useAppDispatch} from "@/redux/hook.ts";

const menuItems = [
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: FileText, label: 'Manage Problems', path: '/admin/problems' },
    { icon: Trophy, label: 'Manage Contests', path: '/admin/contests' },
    { icon: Building, label: 'Manage Companies', path: '/admin/companies' },
    { icon: Tag, label: 'Manage Topics', path: '/admin/topics' },
]

export function AdminPortal() {
    const [expanded, setExpanded] = useState(() => window.innerWidth > 768)
    const location = useLocation()
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handleResize = () => setExpanded(window.innerWidth > 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        getAllTopics().then((topics) => {
            // console.log(topics);
            dispatch(setTopics(topics));
        }).catch((error)=>{
            console.log(error);
        })
    }, []);

    useEffect(() => {
        getAllCompanies().then((companies) => {
            // console.log(companies);
            dispatch(setCompanies(companies));
        }).catch((error)=>{
            console.log(error);
        })
    }, []);

    // console.log("Portal Updated");

    if (location.pathname === '/admin') {
        return <Navigate to="/admin/users" replace />
    }

    return (
        <div className="min-h-screen max-h-screen bg-background">
            <div className="flex min-h-screen">
                <div
                    className={cn(
                        "relative z-30 flex flex-col border-r bg-background transition-all duration-300",
                        expanded ? "w-64" : "w-16"
                    )}
                >
                    <div className="flex items-center justify-between p-4">
                        {expanded && <h2 className="text-lg font-semibold">Admin Portal</h2>}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setExpanded(!expanded)}
                            className="ml-auto"
                        >
                            {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <nav className="flex flex-col gap-2 p-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center rounded-lg px-3 py-2 transition-all hover:bg-accent",
                                        location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                                        !expanded && "justify-center"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {expanded && <span className="ml-3">{item.label}</span>}
                                </Link>
                            ))}
                        </nav>
                    </ScrollArea>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

