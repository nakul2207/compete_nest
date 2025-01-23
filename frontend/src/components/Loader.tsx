import { motion } from "framer-motion"

export function Loader() {
    return (
        <div className="flex items-center justify-center h-screen">
            <motion.div
                className="relative w-32 h-32"
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
            >
                <svg
                    className="absolute top-0 left-0 w-full h-full text-primary"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="40" cy="40" r="30" />
                </svg>
                <motion.svg
                    className="absolute top-1/4 left-1/4 w-10 h-10 -mt-12 -ml-12 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    initial={{opacity: 0, scale: 0.5}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         className="lucide lucide-bird">
                        <path d="M16 7h.01"/>
                        <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/>
                        <path d="m20 7 2 .5-2 .5"/>
                        <path d="M10 18v3"/>
                        <path d="M14 17.75V21"/>
                        <path d="M7 18a6 6 0 0 0 3.84-10.61"/>
                    </svg>
                    {/*<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z" />*/}
                    {/*<circle cx="8.5" cy="9.5" r="1.5" />*/}
                    {/*<circle cx="15.5" cy="9.5" r="1.5" />*/}
                    {/*<path d="M12 16c-1.48 0-2.75-.81-3.45-2h6.9c-.7 1.19-1.97 2-3.45 2z" />*/}
                </motion.svg>
            </motion.div>
        </div>
    )
}

