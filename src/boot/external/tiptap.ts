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
import { EditorView } from 'prosemirror-view';

// Prosemirror fix

const oldUpdateState = EditorView.prototype.updateState;

EditorView.prototype.updateState = function (state) {
  // This prevents the matchesNode error on hot reloads
  // @ts-ignore
  if (!this.docView) {
    return;
  }

  oldUpdateState.call(this, state);
};

// Tiptap stuff

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

import { Y } from '@syncedstore/core';
import {
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProsemirrorJSON,
} from 'y-prosemirror';

export function swapXmlFragments(frag1: Y.XmlFragment, frag2: Y.XmlFragment) {
  const json1 = yXmlFragmentToProsemirrorJSON(frag1);
  const json2 = yXmlFragmentToProsemirrorJSON(frag2);

  prosemirrorJSONToYXmlFragment(tiptap.schema, json2, frag1);
  prosemirrorJSONToYXmlFragment(tiptap.schema, json1, frag2);
}

const _tiptap = {
  extensions,
  schema: getSchema(extensions),

  Collaboration,
  CollaborationCursor,
  EditorContent,
  useEditor,

  swapXmlFragments,
};

declare global {
  /* eslint-disable no-var */
  var tiptap: typeof _tiptap;
}

globalThis.tiptap = _tiptap;
