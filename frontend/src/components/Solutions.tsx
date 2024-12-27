import { useState } from 'react'
import { useAppSelector } from "@/redux/hook.ts"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { languages } from "@/assets/mapping.ts"
import { cn } from "@/lib/utils"

type Language = {
  name: string;
  is_archived: boolean;
  boilerplate: string;
};

type LanguageMap = {
  [key: string]: Language;
};

export function Solutions() {
  const solutionCode = useAppSelector((state) => state.problem.ownerCode);
  const solutionLanguage = useAppSelector((state) => state.problem.ownerCodeLanguage);
  const [copied, setCopied] = useState(false);

  const getLanguageName = (languageId: string): string => {
    const languageMap: LanguageMap = languages;
    return languageMap[languageId]?.name || "Unknown Language";
  };

  const getLanguageForPrism = (languageId: string): string => {
    const languageMap: { [key: string]: string } = {
      "50": "c",
      "54": "cpp",
      "62": "java",
      "63": "javascript",
      "35": "python"
    };
    return languageMap[languageId] || "text";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solutionCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Solution: {getLanguageName(solutionLanguage)}</span>
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    "transition-all",
                    copied && "bg-green-500 text-white hover:bg-green-600"
                )}
                onClick={copyToClipboard}
            >
              {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
              ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SyntaxHighlighter
                language={getLanguageForPrism(solutionLanguage)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
                showLineNumbers
            >
              {solutionCode}
            </SyntaxHighlighter>
          </div>
        </CardContent>
      </Card>
  )
}

