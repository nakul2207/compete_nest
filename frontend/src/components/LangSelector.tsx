import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select.tsx";
import { languages } from "../assets/mapping.ts";

interface LangSelectorProps {
    language_id: string;
    onSelect: (language: string) => void;
}

export const LangSelector = ({ language_id, onSelect }: LangSelectorProps) => {
    return (
        <Select
            defaultValue={language_id}
            onValueChange={(value) => onSelect(value)}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(languages).map(([id, language]) => {
                    // if (!language.is_archived) {
                        return (
                            <SelectItem key={id} value={id}>
                                {language.name}
                            </SelectItem>
                        );
                    // }
                    // return null; // Skip archived languages
                })}
            </SelectContent>
        </Select>
    );
};