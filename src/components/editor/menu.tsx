"use client"
import Image from "next/image"
import { Button } from "../ui/button"
import { useCurrentEditor } from "@tiptap/react"
import { cn } from "@/lib/utils"
import { ColorPicker } from "./color-picker"

import BoldIcon from "../../../public/editorIcons/bold.svg"
import ItalicIcon from "../../../public/editorIcons/italic.svg"
import StrikethroughIcon from "../../../public/editorIcons/strikethrough.svg"
import InlineCodeIcon from "../../../public/editorIcons/code.svg"
import CodeBlockIcon from "../../../public/editorIcons/code-block.svg"
import H1Icon from "../../../public/editorIcons/h1.svg"
import H2Icon from "../../../public/editorIcons/h2.svg"
import H3Icon from "../../../public/editorIcons/h3.svg"
import H4Icon from "../../../public/editorIcons/h4.svg"
import H5Icon from "../../../public/editorIcons/h5.svg"
import H6Icon from "../../../public/editorIcons/h6.svg"
import BulletListIcon from "../../../public/editorIcons/bullet.svg"
import OrderedListIcon from "../../../public/editorIcons/list.svg"
import BlockQuoteIcon from "../../../public/editorIcons/blockquote.svg"
import HorizontalRuleIcon from "../../../public/editorIcons/hr.svg"
import UndoIcon from "../../../public/editorIcons/undo.svg"
import RedoIcon from "../../../public/editorIcons/redo.svg"
import ParagraphIcon from "../../../public/editorIcons/paragraph.svg"
import ClearIcon from "../../../public/editorIcons/clear.svg"
import ClearNodeIcon from "../../../public/editorIcons/clear-node.svg"
import HardbreakIcon from "../../../public/editorIcons/hardbreak.svg"

const MenuBar = ({className}: {
  className:string
}) => {
  const { editor } = useCurrentEditor()
  if (!editor) {
    return null
  }

  return (
    <div className={cn("control-group w-full overflow-x-scroll scrollbar-thumb-rounded-full scrollbar-corner-neutral-50 scrollbar scrollbar-thumb-slate-700 scrollbar-track-transparent", className)}>
      <div className={cn("flex flex-nowrap gap-2  w-screen p-2 bg-gray-700 rounded-xl")}>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }

          className={editor.isActive('bold') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
            <Image  alt='bold' src={BoldIcon} height={20} width={20} className='w-[20px] h-[20px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={editor.isActive('italic') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='Italic' src={ItalicIcon} height={100} width={100} className='w-[18px] h-[18px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={editor.isActive('strike') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='strike' src={StrikethroughIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        {/* <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleCode()
              .run()
          }
          className={editor.isActive('code') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='Code-inline' src={InlineCodeIcon} height={100} width={100} className='w-[18px] h-[18px]' />
        </Button> */}
        {/* <Button
          variant={"icon-button"} onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          <Image alt='Clear marks' src={ClearIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button> */}
        {/* <Button
          variant={"icon-button"} onClick={() => editor.chain().focus().clearNodes().run()}>
          <Image alt='Clear node' src={ClearNodeIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button> */}
        {/* <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='paragraph' src={ParagraphIcon} height={100} width={100} className='w-[17px] h-[17px]' />
        </Button> */}
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='heading 1' src={H1Icon} height={100} width={100} className='w-[25px] h-[25px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='heading 2' src={H2Icon} height={100} width={100} className='w-[25px] h-[25px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='heading 3' src={H3Icon} height={100} width={100} className='w-[25px] h-[25px]' />
        </Button>
        {/* <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='heading 4' src={H4Icon} height={100} width={100} className='w-[25px] h-[25px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='heading 5' src={H5Icon} height={100} width={100} className='w-[25px] h-[25px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='heading 6' src={H6Icon} height={100} width={100} className='w-[25px] h-[25px]' />
        </Button> */}
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='unordered list' src={BulletListIcon} height={100} width={100} className='w-[18px] h-[18px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='ordered list' src={OrderedListIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='code block' src={CodeBlockIcon} height={100} width={100} className='w-[22px] h-[22px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-secondary dark:bg-lime-500' : ''}
        >
          <Image alt='block quote' src={BlockQuoteIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        <Button
          variant={"icon-button"} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Image alt='horizontal rule' src={HorizontalRuleIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        <Button
          variant={"icon-button"} onClick={() => editor.chain().focus().setHardBreak().run()}>
          <Image alt='hard break' src={HardbreakIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          <Image alt='undo' src={UndoIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        <Button
          variant={"icon-button"}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          <Image alt='redo' src={RedoIcon} height={100} width={100} className='w-[20px] h-[20px]' />
        </Button>
        <ColorPicker
          currentColor={editor.getAttributes('textStyle').color}
          onColorChange={(color) => editor.chain().focus().setColor(color).run()}
          className={editor.isActive('textStyle') ? 'bg-secondary dark:bg-lime-500' : ''}
        />
      </div>
    </div>
  )
}

export default MenuBar
