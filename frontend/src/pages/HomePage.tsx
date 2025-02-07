import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useAnimation } from "framer-motion"
import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TypeAnimation } from 'react-type-animation'
import img from "../assets/png-clipart-ai-generated-man-beard-tiktok-face-male-social-media-3d-character-candidphotocontest.png"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ElementType
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon }) => (
  <motion.div
    className="bg-background/10 backdrop-blur-lg border border-primary/20 rounded-2xl p-8 shadow-2xl hover:shadow-primary/20 relative overflow-hidden group transition-all duration-300"
    whileHover={{ y: -10, scale: 1.02 }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-gray-600"
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        transition={{ duration: 2, delay: 0.5 }}
      />
    </div>

    <motion.div
      className="bg-gradient-to-br from-primary/10 to-cyan-400/10 p-4 rounded-xl w-fit mb-6 border border-primary/20 backdrop-blur-sm"
      whileHover={{ rotate: 5, scale: 1.05 }}
    >
      <Icon className="h-8 w-8 text-primary text-gray-600 animate-pulse transition-colors" />
    </motion.div>

    <h3 className="text-2xl font-bold mb-3 font-mono bg-gradient-to-r from-primary to-gray-600 bg-clip-text text-transparent relative inline-block">
      <span className="absolute inset-0 bg-gradient-to-r from-primary/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full h-full -skew-x-12" />
      {title}
    </h3>

    <motion.p
      className="text-muted-foreground leading-relaxed font-mono text-base group-hover:text-foreground transition-colors"
      whileHover={{ scale: 1.02 }}
    >
      {description}
    </motion.p>

    {/* <motion.div
      className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-300"
      whileHover={{ scale: 1.2 }}
    >
      <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4m-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"
        />
      </svg>
    </motion.div> */}

    <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-cyan-400/10 blur-xl animate-tilt" />
    </div>
  </motion.div>
)

interface TeamMemberProps {
  name: string
  role: string
  intro: string
  github: string
  linkedin: string
  image: string
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, intro, github, linkedin, image }) => (
  <motion.div
    className="flex flex-col items-center text-center"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <img src={image || "/placeholder.svg"} alt={name} className="w-32 h-32 rounded-full mb-4 object-cover" />
    <h3 className="text-xl font-semibold">{name}</h3>
    <p className="text-muted-foreground mb-2">{role}</p>
    <p className="text-sm mb-4">{intro}</p>
    <div className="flex space-x-4">
      <a href={github} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s GitHub`}>
        <Github className="h-6 w-6" />
      </a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s LinkedIn`}>
        <Linkedin className="h-6 w-6" />
      </a>
    </div>
  </motion.div>
)

interface AnimatedSectionProps {
  children: React.ReactNode
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-32 relative overflow-hidden">
      {/* Animated background elements - Add color variation */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `radial-gradient(circle, #2563eb 1px, #7c3aed 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <section className="text-center space-y-12 relative z-10">
        <motion.div
          className="inline-block relative"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
        >
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10" />
          <motion.h1
            className="text-6xl font-black bg-gradient-to-b from-primary to-foreground bg-clip-text text-transparent tracking-tighter mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CompeteNest
          </motion.h1>
        </motion.div>

        <motion.div
          className="text-3xl text-muted-foreground font-mono h-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <TypeAnimation
            sequence={[
              'Elevate Your Coding Skills',
              2000,
              'Master Data Structures',
              2000,
              'Conquer Algorithms',
              2000,
              'Win Competitions',
              2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </motion.div>

        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.02 }}
            >
              {/* <div className="absolute -inset-1 bg-gradient-to-r from-primary to-gray-500 rounded-2xl opacity-20 blur transition duration-1000 group-hover:opacity-40" /> */}
              <Button
                size="lg"
                className="text-lg px-12 py-6 rounded-2xl relative border border-primary/50 hover:border-primary"
              >
                <Link to="/problems" className="font-mono tracking-tighter">
                  $ git start coding
                </Link>
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>
      </section>

      <AnimatedSection>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <FeatureCard
            title="DSA Problem Set"
            description="Practice and improve your skills with our curated collection of Data Structures and Algorithms problems."
            icon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
                />
              </svg>
            )}
          />
          <FeatureCard
            title="Inbuilt Editor"
            description="Code seamlessly with our powerful and feature-rich integrated development environment."
            icon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
            )}
          />
          <FeatureCard
            title="Online Compiler"
            description="Compile and run your code instantly with support for multiple programming languages."
            icon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
            )}
          />
          <FeatureCard
            title="Dynamic Contests"
            description="Participate in coding contests and compete against others with real-time leaderboards."
            icon={() => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
                />
              </svg>
            )}
          />
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="text-center relative">
          <h2 className="text-4xl font-bold mb-16 inline-block relative font-mono">
            <span className="bg-gradient-to-r from-primary to-gray-600 bg-clip-text text-transparent">
              git commit -m "Team"
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <TeamMember
              name="Dinesh Kumar"
              role="Lead Developer"
              intro="Passionate about creating efficient algorithms and scalable systems."
              github="https://github.com/DineshK3012/"
              linkedin="https://www.linkedin.com/in/dinesh-kumar-06ab741ba/"
              image={img}
            />
            <TeamMember
              name="Nakul Gupta"
              role="Lead Developer"
              intro="Dedicated to crafting intuitive and beautiful user experiences."
              github="https://github.com/nakul2207"
              linkedin="https://www.linkedin.com/in/nakul-gupta-321893203/"
              image={img}
            />
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="relative bg-gradient-to-br  backdrop-blur-lg border border-blue-200/10 rounded-3xl p-12 shadow-2xl">
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-gray-600"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-4xl font-bold mb-12 font-mono bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            // Contact Form
          </h2>
          <div className="max-w-2xl mx-auto space-y-8">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Input
                className="h-16 text-lg rounded-2xl border-primary/20 bg-background/50 font-mono placeholder:text-muted-foreground/50"
                placeholder="const name = "
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Input
                className="h-16 text-lg rounded-2xl border-primary/20 bg-background/50 font-mono placeholder:text-muted-foreground/50"
                placeholder="let email = "
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Textarea
                className="text-lg rounded-2xl border-primary/20 bg-background/50 font-mono placeholder:text-muted-foreground/50 h-48"
                placeholder="/* Your message */"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="w-full h-16 text-xl font-mono bg-primary/90 hover:bg-primary transition-all rounded-2xl shadow-lg"
              >
                Submit PR
              </Button>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <motion.footer className="relative border-t border-cyan-400/20 mt-16 pt-12 bg-gradient-to-b from-blue-900/10 to-transparent">
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 text-muted-foreground">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">CompeteNest</h4>
              <p className="text-sm font-mono">
                Level up your coding skills with interactive challenges and real-world projects.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-600">Quick Links</h5>
              <ul className="space-y-2 font-mono text-sm">
                <li><a href="/problems" className="hover:text-purple-300 transition-colors">Problems</a></li>
                <li><a href="/contests" className="hover:text-purple-300 transition-colors">Contests</a></li>
                <li><a href="/leaderboard" className="hover:text-purple-300 transition-colors">Leaderboard</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold">Resources</h5>
              <ul className="space-y-2 font-mono text-sm">
                <li><a href="/docs" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="/community" className="hover:text-primary transition-colors">Community</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold">Connect</h5>
              <div className="flex space-x-4">
                <a href="https://github.com" target="_blank" className="hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" className="hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:contact@competenest.com" className="hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              <p className="text-xs font-mono mt-4 opacity-75">
                © {new Date().getFullYear()} CompeteNest. All rights reserved.
              </p>
            </div>
          </div>

          <motion.div
            className="mt-12 pt-8 border-t border-border/20 text-center text-xs font-mono opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
          >
            <span className="animate-pulse">🚀</span> Powered by TypeScript, React, and Tailwind CSS
          </motion.div>
        </motion.footer>
      </AnimatedSection>
    </div>
  )
}