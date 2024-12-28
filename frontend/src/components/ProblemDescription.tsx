import React from 'react'
import { useAppSelector } from "@/redux/hook.ts"
import ReactMarkdown from 'react-markdown'
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

export function ProblemDescription() {
    const problem = useAppSelector((state) => state.problem)

    const renderMarkdown = (content: string) => (
        <ReactMarkdown
            components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
                li: ({ children }) => <li className="mb-2">{children}</li>,
                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded">{children}</code>,
            }}
        >
            {content}
        </ReactMarkdown>
    )

    const getBadgeVariant = (difficulty: string): BadgeVariant => {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return "success"
            case "medium":
                return "warning"
            case "hard":
                return "destructive"
            default:
                return "default"
        }
    }

    return (
        <ScrollArea className="h-[calc(100vh-4rem)] w-full">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-bold">{problem.title}</CardTitle>
                            <Badge variant={getBadgeVariant(problem.difficulty)}>
                                {problem.difficulty}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Section title="Description" content={problem.description} renderContent={renderMarkdown} />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Section title="Input" content={problem.inputFormat} renderContent={renderMarkdown} />
                        <Separator className="my-4" />
                        <Section title="Output" content={problem.outputFormat} renderContent={renderMarkdown} />
                        <Separator className="my-4" />
                        <Section title="Constraints" content={problem.constraints} renderContent={renderMarkdown} />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="topics">
                                <AccordionTrigger>Topics</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2">
                                        {problem.topics.map((topic, index) => (
                                            <Badge key={index} variant="outline">{topic}</Badge>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="companies">
                                <AccordionTrigger>Companies</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2">
                                        {problem.companies.map((company, index) => (
                                            <Badge key={index} variant="outline">{company}</Badge>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    )
}

function Section({ title, content, renderContent }: { title: string; content: string; renderContent: (content: string) => React.ReactNode }) {
    return (
        <div className="mb-6 last:mb-0">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="pl-4">{renderContent(content)}</div>
        </div>
    )
}

