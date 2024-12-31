import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { Button } from '../ui/button';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImagePlus,
  RefreshCw,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onImageRegenerate?: () => Promise<string>;
  imageUrl?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder,
  onImageUpload,
  onImageRegenerate,
  imageUrl 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg w-full max-h-[400px] object-cover',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] text-purple-200/90',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: true,
    injectCSS: true,
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImageUpload || !e.target.files?.[0]) return;
    try {
      const url = await onImageUpload(e.target.files[0]);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleImageRegenerate = async () => {
    if (!onImageRegenerate) return;
    try {
      const url = await onImageRegenerate();
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Error regenerating image:', error);
    }
  };

  return (
    <div className="border border-purple-500/20 rounded-lg overflow-hidden bg-purple-500/10">
      <div className="border-b border-purple-500/20 p-2 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('bold') ? 'bg-purple-500/20' : ''
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('italic') ? 'bg-purple-500/20' : ''
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-purple-500/20' : ''
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-purple-500/20' : ''
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('bulletList') ? 'bg-purple-500/20' : ''
          }`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('orderedList') ? 'bg-purple-500/20' : ''
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 ${
            editor.isActive('blockquote') ? 'bg-purple-500/20' : ''
          }`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        {onImageUpload && (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </div>
        )}
        {onImageRegenerate && imageUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageRegenerate}
            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
      {imageUrl && (
        <div className="relative w-full aspect-[16/9] mt-4">
          <img
            src={imageUrl}
            alt="Section illustration"
            className="rounded-lg w-full h-full object-cover"
          />
          {onImageRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageRegenerate}
              className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 