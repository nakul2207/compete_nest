'use client'
import React, { useMemo } from 'react'
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

const MarkdownEditorComponent = React.memo(({ value, onChange, placeholder }: MarkdownEditorProps) => {
    const plugins = useMemo(
        () => [
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
        ],
        []
    );

    const handleChange = useMemo(() => (value: string) => {
        onChange(value);
    }, [onChange]);

    console.log("editor rendered")

    return (
        <div className="relative min-h-[200px] w-full rounded-md border border-input bg-background">
            <MDXEditor
                markdown={value}
                onChange={handleChange}
                placeholder={placeholder}
                contentEditableClassName="prose dark:prose-invert max-w-none dark:text-white"
                plugins={plugins}
            />
        </div>
    );
});

MarkdownEditorComponent.displayName = 'MarkdownEditor';

export const MarkdownEditor = MarkdownEditorComponent;

