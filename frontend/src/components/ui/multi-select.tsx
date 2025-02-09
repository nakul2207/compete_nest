import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Option {
    id: string
    name: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    label?: string
}

export function MultiSelect({
                                options,
                                selected,
                                onChange,
                                placeholder = "Select options",
                                label
                            }: MultiSelectProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
          <span className="line-clamp-1">
            {selected.length === 0
                ? placeholder
                : `${selected.length} selected`}
          </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {label && (
                    <>
                        <DropdownMenuLabel>{label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}
                {options.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option.id}
                        checked={selected.includes(option.id)}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                onChange([...selected, option.id])
                            } else {
                                onChange(selected.filter((id) => id !== option.id))
                            }
                        }}
                    >
            <span className="flex items-center gap-2">
              {option.name}
            </span>
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

