import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { lowlight } from 'lowlight/lib/core';

export const TiptapExtensions = [
  StarterKit.configure({
    history: false,
    codeBlock: false,
  }),

  Underline,

  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),

  CodeBlockLowlight.configure({
    lowlight,
  }),

  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
];
