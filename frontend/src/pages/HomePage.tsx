import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useAnimation } from "framer-motion"
import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ElementType
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon }) => (
    <motion.div
        className="bg-card text-card-foreground rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
      <Icon className="h-12 w-12 mb-4 text-primary" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
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
      <div className="container mx-auto px-4 py-16 space-y-32">
        <section className="text-center space-y-8">
          <motion.h1
              className="text-5xl font-bold"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
          >
            Compete Nest
          </motion.h1>
          <motion.p
              className="text-2xl text-muted-foreground"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
          >
            Elevate Your Coding Skills
          </motion.p>
          <AnimatedSection>
            <p className="max-w-2xl mx-auto text-lg mb-8">
              Compete Nest is your ultimate platform for honing your programming skills, participating in exciting coding
              contests, and connecting with fellow developers. Whether you're a beginner or an expert, our comprehensive
              set of features will help you grow and excel in your coding journey.
            </p>
            <Button size="lg" className="text-lg px-8 py-6">
              <Link to="/problems">Get Started</Link>
            </Button>
          </AnimatedSection>
        </section>

        <AnimatedSection>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                        className="w-12 h-12"
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
                        className="w-12 h-12"
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
                        className="w-12 h-12"
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
                        className="w-12 h-12"
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
          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-12">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <TeamMember
                  name="Dinesh Kumar"
                  role="Lead Developer"
                  intro="Passionate about creating efficient algorithms and scalable systems."
                  github="https://github.com/DineshK3012/"
                  linkedin="https://www.linkedin.com/in/dinesh-kumar-06ab741ba/"
                  image="/placeholder.svg?height=128&width=128"
              />
              <TeamMember
                  name="Nakul Gupta"
                  role="Lead Developer"
                  intro="Dedicated to crafting intuitive and beautiful user experiences."
                  github="https://github.com/nakul2207"
                  linkedin="https://www.linkedin.com/in/nakul-gupta-321893203/"
                  image="/placeholder.svg?height=128&width=128"
              />
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-8">Contact Us</h2>
            <div className="max-w-2xl mx-auto">
              <form className="space-y-6">
                <Input type="text" placeholder="Your Name" />
                <Input type="email" placeholder="Your Email" />
                <Textarea placeholder="Your Message" rows={4} />
                <Button type="submit" size="lg">
                  Send Message
                </Button>
              </form>
              {/*<div className="mt-12 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">*/}
              {/*  <div className="flex items-center">*/}
              {/*    <Mail className="mr-2" />*/}
              {/*    <span>contact@competenest.com</span>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-center">*/}
              {/*    <Phone className="mr-2" />*/}
              {/*    <span>+1 (123) 456-7890</span>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-center">*/}
              {/*    <MapPin className="mr-2" />*/}
              {/*    <span>123 Coding Street, Tech City</span>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          </section>
        </AnimatedSection>
      </div>
  )
}

