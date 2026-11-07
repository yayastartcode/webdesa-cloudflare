'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import { uploadFile } from '@/lib/upload'
import { Bold, Italic, List, Loader2, Image as ImageIcon } from 'lucide-react'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  onUploadStateChange?: (pending: boolean) => void
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  onUploadStateChange,
}: RichTextEditorProps) {
  const imageInput = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState('')
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4 border rounded-md ${className}`,
        'data-placeholder': placeholder,
      },
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file || !editor) return
    setUploading(true)
    setUploadError('')
    onUploadStateChange?.(true)
    try {
      const image = await uploadFile(file)
      if (!editor.isDestroyed) editor.chain().focus().setImage({ src: image.url, alt: file.name }).run()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload gambar gagal')
    } finally {
      setUploading(false)
      onUploadStateChange?.(false)
      input.value = ''
    }
  }

  if (!editor) {
    return (
      <div className={`min-h-[200px] p-4 border rounded-md bg-gray-50 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex gap-1">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Tambah gambar dalam konten"
          title="Tambah gambar dalam konten"
          disabled={uploading}
          onClick={() => imageInput.current?.click()}
          className="h-8 w-8 p-0"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      </div>
      
      <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only"
        aria-label="Upload gambar dalam konten" disabled={uploading} onChange={handleImageUpload} />
      {uploading && <p role="status" className="px-4 py-2 text-sm">Mengunggah gambar, mohon tunggu...</p>}
      {uploadError && <p role="alert" className="px-4 py-2 text-sm text-red-600">{uploadError}</p>}
      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="tiptap-editor"
        />
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {/* Custom Styles */}
      <style>{`
        .tiptap-editor .ProseMirror {
          outline: none;
          padding: 1rem;
          min-height: 200px;
        }
        
        .tiptap-editor .ProseMirror p {
          margin: 0.5rem 0;
        }
        
        .tiptap-editor .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .tiptap-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .tiptap-editor .ProseMirror ul {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .tiptap-editor .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .tiptap-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        
        .tiptap-editor .ProseMirror strong {
          font-weight: 600;
        }
        
        .tiptap-editor .ProseMirror em {
          font-style: italic;
        }
        
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}