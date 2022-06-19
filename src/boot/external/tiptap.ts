import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, Extension, getSchema, useEditor } from '@tiptap/vue-3';
import { columnResizing } from 'prosemirror-tables';

const extensions = [
  StarterKit.configure({
    history: false,
    codeBlock: false,
  }),

  Underline,

  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),

  Subscript,
  Superscript,

  Link.configure({
    openOnClick: false,
  }),

  Image,

  TaskList,
  TaskItem.configure({
    nested: true,
    onReadOnlyChecked: () => true,
  }),

  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,

  CodeBlockLowlight.configure({
    lowlight: lowlight,
  }),

  Extension.create({
    addProseMirrorPlugins() {
      return [columnResizing({})];
    },
  }),
];

declare global {
  /* eslint-disable no-var */
  var tiptap: {
    extensions: typeof extensions;
    Collaboration: typeof Collaboration;
    CollaborationCursor: typeof CollaborationCursor;
    EditorContent: typeof EditorContent;
    useEditor: typeof useEditor;
    getSchema: typeof getSchema;
  };
}

globalThis.tiptap = {
  extensions,
  Collaboration,
  CollaborationCursor,
  EditorContent,
  useEditor,
  getSchema,
};
