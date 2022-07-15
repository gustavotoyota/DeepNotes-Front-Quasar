import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
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
import { Extension } from '@tiptap/vue-3';
import { columnResizing } from 'prosemirror-tables';

import { ImageResizeExtension } from './image-resize-extension';

export const noteExtensions = [
  StarterKit.configure({
    history: false,
    codeBlock: false,

    horizontalRule: false,
  }),

  HorizontalRule.configure({
    HTMLAttributes: {
      draggable: 'false',
    },
  }),

  Underline,

  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),

  Subscript,
  Superscript,

  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      draggable: 'false',
    },
  }),

  ImageResizeExtension.configure({
    inline: true,
    allowBase64: true,
  }),

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
