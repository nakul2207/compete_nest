import React from "react";
import { useAppSelector } from "@/redux/hook.ts"
import ReactMarkdown from 'react-markdown'
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {Separator} from "@/components/ui/separator.tsx";

type BadgeVariant = "success" | "warning" | "danger" | "destructive";

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
        switch (difficulty) {
            case "Easy":
                return "success";
            case "Medium":
                return "warning";
            case "Hard":
                return "danger";
            default:
                return "destructive";
        }
    };

    return (
        <>
        {/*// <ScrollArea className="h-[calc(100vh-4rem)] w-full max-w-4xl mx-auto">*/}
            <div className="p-2 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <Badge className="text-sm" variant={getBadgeVariant(problem.difficulty)}>
                        {problem.difficulty}
                    </Badge>
                </div>
                <Separator className="my-4" />

                <Section title="Description" content={problem.description} renderContent={renderMarkdown} />
                <Section title="Input" content={problem.inputFormat} renderContent={renderMarkdown} />
                <Section title="Output" content={problem.outputFormat} renderContent={renderMarkdown} />
                <Section title="Constraints" content={problem.constraints} renderContent={renderMarkdown} />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="topics">
                        <AccordionTrigger className="hover:no-underline">Topics</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-wrap gap-2">
                                {problem.topics.map((topic, index) => (
                                    <Badge key={index} variant="outline">{topic}</Badge>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="companies">
                        <AccordionTrigger className="hover:no-underline">Companies</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-wrap gap-2">
                                {problem.companies.map((company, index) => (
                                    <Badge key={index} variant="outline">{company}</Badge>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        {/*</ScrollArea>*/}
        </>
    )
}

function Section({ title, content, renderContent }: { title: string; content: string; renderContent: (content: string) => React.ReactNode }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">
                {title}
            </h3>
            <div className="pl-6">
                {renderContent(content)}
            </div>
        </div>
    )
}

