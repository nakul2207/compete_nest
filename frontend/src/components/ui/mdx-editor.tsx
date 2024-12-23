'use client'
import {
    MDXEditor,
    UndoRedo,
    BoldItalicUnderlineToggles,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    linkDialogPlugin,
    tablePlugin,
    toolbarPlugin,
    BlockTypeSelect,
    CreateLink,
    InsertTable,
    ListsToggle,
    markdownShortcutPlugin,
} from '@mdxeditor/editor'

import '@mdxeditor/editor/style.css'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
    return (
        <div className="relative min-h-[200px] w-full rounded-md border border-input bg-background">
            <MDXEditor
                markdown={value}
                onChange={onChange}
                placeholder={placeholder}
                contentEditableClassName="prose dark:prose-invert max-w-none dark:text-white"
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    tablePlugin(),
                    markdownShortcutPlugin(),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
                                <UndoRedo />
                                <BoldItalicUnderlineToggles />
                                <BlockTypeSelect />
                                <CreateLink />
                                <InsertTable />
                                <ListsToggle />
                            </>
                        ),
                    }),
                ]}
            />
        </div>
    )
}
