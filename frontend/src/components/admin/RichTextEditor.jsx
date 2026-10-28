import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  Indent,
  IndentBlock,
  BlockQuote,
  Alignment,
  Table,
  TableToolbar,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  SimpleUploadAdapter,
  SourceEditing
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import './RichTextEditor.css'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

// Rich text editor for admin content fields (berita, artikel, dst).
// Uploads images pasted/inserted into the content straight to the backend
// and stores the resulting HTML — the public detail pages already render
// this field via dangerouslySetInnerHTML, so no other wiring is needed.
const RichTextEditor = ({ value, onChange }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value || ''}
      onChange={(_event, editor) => onChange(editor.getData())}
      config={{
        licenseKey: 'GPL',
        plugins: [
          Essentials, Paragraph, Heading,
          Bold, Italic, Underline, Strikethrough,
          Link, List, Indent, IndentBlock, BlockQuote, Alignment,
          Table, TableToolbar,
          Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize,
          SimpleUploadAdapter, SourceEditing
        ],
        toolbar: [
          'undo', 'redo', '|',
          'heading', '|',
          'bold', 'italic', 'underline', 'strikethrough', '|',
          'alignment', 'bulletedList', 'numberedList', 'outdent', 'indent', '|',
          'link', 'blockQuote', 'insertTable', 'imageUpload', '|',
          'sourceEditing'
        ],
        image: {
          toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative', 'resizeImage']
        },
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        },
        simpleUpload: {
          uploadUrl: `${baseURL}/admin/berita/upload-image`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      }}
    />
  )
}

export default RichTextEditor
