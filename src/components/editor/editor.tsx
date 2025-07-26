"use client"
import './styles.scss'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import TiptapImage from '@tiptap/extension-image'
import { EditorProvider, Node, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import Image from 'next/image'
import { uploadImageToS3, isValidImageFile, getImageFromClipboard } from '@/lib/image-upload'


import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import MenuBar from '@/components/editor/menu'



const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  //@ts-ignore
  TextStyle.configure({ types: [ListItem.name] }),
  TiptapImage.configure({
    inline: true,
    allowBase64: false,
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded-lg',
    },
  }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, xawaiting a bit of help
      HTMLAttributes: {
        class: "list-disc"
      }
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      HTMLAttributes: {
        class: "list-decimal"
      }
    },
    bold: {
      HTMLAttributes: {
        // class: "something text-red-500"
      }
    },
    italic: {
      HTMLAttributes: {

      }
    },
    blockquote: {
      HTMLAttributes: {
        class: "bg-lime-400 dark:bg-lime-700 dark:text-white border-l-4 border-blue-500 pl-4 py-3 text-gray-700 italic"
      }
    },
    code: {
      HTMLAttributes: {

      }
    },
    codeBlock: {
      HTMLAttributes: {

      }
    },
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {
        class: "font-extrabold py-1 border-b-[1px] border-lime-500"
      }
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "border-b-2 border-black block w-full bg-lime-500 py-[0.5px] ",
      }
    }


  }),
]

export default ({className, editable, containerClassName, content, onUpdate,menuBarClassName,onFocus,onBlur}: {
  className?:string;
  editable?: boolean;
  containerClassName?: string;
  menuBarClassName? :string;
  content: string;
  onUpdate?: (val:string) => void
  onFocus?:() => void
  onBlur?: () => void
}) => {
  if(editable == undefined){
    editable = true;
  }
  return (
    <>
      <div className={cn("", containerClassName)}>
        <EditorProvider   
          autofocus 
          slotBefore={editable ? <MenuBar className={menuBarClassName||""}/>: <></>} 
          immediatelyRender={false}   
          extensions={extensions} 
          editorProps={{
            attributes: {
              class: className||""
            },
            handlePaste: (view, event, slice) => {
              // Handle image paste from clipboard
              const clipboardData = event.clipboardData;
              if (!clipboardData) return false;

              const items = Array.from(clipboardData.items);
              const imageItem = items.find(item => item.type.startsWith('image/'));
              
              if (imageItem) {
                event.preventDefault();
                
                const file = imageItem.getAsFile();
                if (!file || !isValidImageFile(file)) {
                  return true;
                }
                
                // Insert a placeholder first
                const { state, dispatch } = view;
                const pos = state.selection.from;
                
                // Create a unique placeholder ID
                const placeholderId = `uploading-${Date.now()}`;
                const placeholderText = `[Uploading image ${placeholderId}...]`;
                
                const tr = state.tr.insertText(placeholderText, pos);
                dispatch(tr);
                
                // Upload image asynchronously
                uploadImageToS3(file)
                  .then((imageUrl: string) => {
                    // Replace placeholder with actual image
                    const currentState = view.state;
                    const doc = currentState.doc;
                    let found = false;
                    
                    doc.descendants((node, pos) => {
                      if (found) return false;
                      if (node.isText && node.text?.includes(placeholderText)) {
                        const from = pos + node.text.indexOf(placeholderText);
                        const to = from + placeholderText.length;
                        
                        const tr = currentState.tr
                          .delete(from, to)
                          .insert(from, currentState.schema.nodes.image.create({ 
                            src: imageUrl,
                            alt: 'Uploaded image'
                          }));
                        
                        view.dispatch(tr);
                        found = true;
                        return false;
                      }
                    });
                  })
                  .catch((error) => {
                    console.error('Failed to upload pasted image:', error);
                    // Replace placeholder with error message
                    const currentState = view.state;
                    const doc = currentState.doc;
                    let found = false;
                    
                    doc.descendants((node, pos) => {
                      if (found) return false;
                      if (node.isText && node.text?.includes(placeholderText)) {
                        const from = pos + node.text.indexOf(placeholderText);
                        const to = from + placeholderText.length;
                        
                        const tr = currentState.tr
                          .delete(from, to)
                          .insertText('[Image upload failed]', from);
                        
                        view.dispatch(tr);
                        found = true;
                        return false;
                      }
                    });
                  });
                
                return true;
              }
              return false; // Let TipTap handle other paste events
            }
          }}  
          editable={editable} 
          content={content} 
          onUpdate={({editor}) => {
            if(onUpdate){
              onUpdate(editor.getHTML())
            }
          }} 
        ></EditorProvider>
      </div>
    </>
  )
}
