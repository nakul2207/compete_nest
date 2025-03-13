import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useAnimation } from "framer-motion"
import { Github, Linkedin, Mail, CodeXml, Trophy, Medal, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TypeAnimation } from "react-type-animation"
// import img from "../assets/png-clipart-ai-generated-man-beard-tiktok-face-male-social-media-3d-character-candidphotocontest.png"
import Dinesh from "../assets/developers/Dinesh.jpg"
import Nakul from "../assets/developers/Nakul.jpg"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ElementType
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon }) => (
  <motion.div
    className="bg-background/90 backdrop-blur-lg border border-primary/20 rounded-2xl p-8 shadow-2xl hover:shadow-primary relative overflow-hidden group transition-all duration-300"
    whileHover={{ y: -10, scale: 1.02 }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-white"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 2, delay: 0.5 }}
      />
    </div>

    <motion.div
      className="bg-gradient-to-br from-primary/10 to-cyan-400/10 p-4 rounded-xl w-fit mb-6 border border-primary/20 backdrop-blur-sm"
      whileHover={{ rotate: 5, scale: 1.05 }}
    >
      <Icon className="h-8 w-8 text-primary text-gray-600 animate-pulse transition-colors" />
    </motion.div>

    <h3 className="text-2xl font-bold mb-3 font-mono bg-white bg-clip-text text-transparent relative inline-block">
      <span className="absolute inset-0 bg-gradient-to-r from-primary/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full h-full -skew-x-12" />
      <span className="text-primary dark:text-white">{title}</span>
    </h3>

    <motion.p
      className="text-muted-foreground leading-relaxed font-mono text-base group-hover:text-foreground transition-colors"
      whileHover={{ scale: 1.02 }}
    >
      {description}
    </motion.p>

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
    <img
      src={image || "/placeholder.svg"}
      alt={name}
      className="w-32 h-32 rounded-full mb-4 object-cover shadow-lg border-2 border-primary"
    />
    <h3 className="text-xl font-semibold text-primary">{name}</h3>
    <p className="text-muted-foreground mb-2 font-medium">{role}</p>
    <p className="text-sm mb-4 max-w-xs">{intro}</p>
    <div className="flex space-x-4">
      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name}'s GitHub`}
        className="hover:text-primary transition-colors"
      >
        <Github className="h-6 w-6" />
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name}'s LinkedIn`}
        className="hover:text-primary transition-colors"
      >
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
    <div className="w-full py-16 space-y-44 relative overflow-hidden">
      <div className="h-10 bg-primary w-full absolute top-0 left-0 z-0 text-sm md:text:lg text-center text-white flex items-center justify-center font-semibold shadow-md">
        One of the best platforms to improve your coding skills!
      </div>
      <section className="text-center space-y-12 relative z-10">
        <motion.div
          className="inline-block relative"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
        >
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10" />
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-b from-primary to-foreground bg-clip-text text-transparent tracking-tighter mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CompeteNest
          </motion.h1>
        </motion.div>

        <motion.div
          className="text-xl md:text-3xl lg:text-4xl text-muted-foreground font-mono h-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <TypeAnimation
            sequence={[
              "Elevate Your Coding Skills",
              2000,
              "Master Data Structures",
              2000,
              "Conquer Algorithms",
              2000,
              "Win Competitions",
              2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Number.POSITIVE_INFINITY}
          />
        </motion.div>

        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <motion.div className="relative group" whileHover={{ scale: 1.05 }}>
              {/* <div className="absolute -inset-1 bg-gradient-to-r from-primary to-gray-500 rounded-2xl opacity-70 blur transition duration-1000 group-hover:opacity-100 animate-tilt" /> */}
              <Button
                size="lg"
                className="relative text-lg px-8 py-4 rounded-2xl border-2 border-primary hover:border-primary bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Link to="/problems" className="font-mono tracking-tighter">
                  $ start coding
                </Link>
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>
      </section>

      <AnimatedSection>
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 bg-primary">
          <div className="flex flex-col justify-center p-6 md:p-8 space-y-2 md:space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-mono bg-white bg-clip-text text-transparent relative inline-block">
              <span className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full h-full -skew-x-12" />
              Why CompeteNest?
            </h2>
            <p className="text-muted-foreground font-mono text-lg text-white">
              CompeteNest is a platform to help you improve your coding skills through interactive
              problems, competitive contests, and community support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            <FeatureCard
              title="Interactive Problems"
              description="Solve coding challenges with real-time feedback and detailed solutions."
              icon={CodeXml}
            />
            <FeatureCard
              title="Competitive Contests"
              description="Participate in weekly contests and compete with other developers."
              icon={Trophy}
            />
            <FeatureCard
              title="Leaderboard Rankings"
              description="Track your progress and compare your skills with other developers."
              icon={Medal}
            />
            <FeatureCard
              title="Community Support"
              description="Join our community to discuss problems, contests, and more."
              icon={Users}
            />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <section className="p-2 text-center relative">
          <h2 className="text-4xl font-bold mb-10 md:mb-16 inline-block relative font-mono">
            <span className="bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
              Meet the "Developers"
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <TeamMember
              name="Dinesh Kumar"
              role="Lead Developer"
              intro="Passionate about creating efficient algorithms and scalable systems."
              github="https://github.com/DineshK3012/"
              linkedin="https://www.linkedin.com/in/dinesh-kumar-06ab741ba/"
              image={Dinesh}
            />
            <TeamMember
              name="Nakul Gupta"
              role="Lead Developer"
              intro="Dedicated to crafting intuitive and beautiful user experiences."
              github="https://github.com/nakul2207"
              linkedin="https://www.linkedin.com/in/nakul-gupta-321893203/"
              image={Nakul}
            />
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <div>
          <div className="relative w-full h-16 overflow-hidden bg-primary text-white">
            <motion.div
              className="absolute top-0 left-0 w-full h-full flex items-center"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <div className="flex space-x-64 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Innovate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Create</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Collaborate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Inspire</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Learn</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Grow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Achieve</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">Succeed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.footer className="relative border-t border-cyan-400/20  pt-10 bg-gradient-to-b from-blue-900/10 to-transparent">
          <div className="w-full px-4 pt-0 pb-2 grid grid-cols-1 md:grid-cols-4 gap-8 text-muted-foreground">
            <div className="space-y-4">
              <Link to="/">
                <h4 className="text-2xl font-semibold text-primary">
                  CompeteNest
                </h4>
              </Link>
              <p className="text-sm font-mono">
                Level up your coding skills with interactive challenges and real-world projects.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold">Quick Links</h5>
              <ul className="space-y-2 font-mono text-sm">
                <li>
                  <a href="/problems" className="hover:text-primary transition-colors">
                    Problems
                  </a>
                </li>
                <li>
                  <a href="/contests" className="hover:text-primary transition-colors">
                    Contests
                  </a>
                </li>
                <li>
                  <a href="/contests" className="hover:text-primary transition-colors">
                    Leaderboard
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold">Resources</h5>
              <ul className="space-y-2 font-mono text-sm">
                <li>
                  <a href="/docshttps://github.com/DineshK3012/compete_nest" className="hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/community" className="hover:text-primary transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold">Connect</h5>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/DineshK3012/compete_nest"
                  target="_blank"
                  className="hover:text-primary transition-colors"
                  rel="noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/dinesh-kumar-06ab741ba/"
                  target="_blank"
                  className="hover:text-primary transition-colors"
                  rel="noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:competenest@gmail.com" className="hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              {/* <p className="text-center text-sm font-mono mt-4 opacity-75">
                &#169; {new Date().getFullYear()} CompeteNest. All rights reserved.
              </p> */}
            </div>
          </div>

          <motion.div
            className="mt-6 border-t border-border/20 text-center text-sm font-mono opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
          >
            {/* <span className="animate-pulse">🚀</span> Powered by TypeScript, React, and Tailwind CSS */}
            <span className="text-lg animate-pulse">&copy;</span> {new Date().getFullYear()} CompeteNest. All rights reserved.
          </motion.div>
        </motion.footer>
      </AnimatedSection>
    </div>
  )
}

