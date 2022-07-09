import { Y } from '@syncedstore/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
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
import {
  prosemirrorJSONToYXmlFragment,
  ySyncPluginKey,
  yXmlFragmentToProsemirrorJSON,
} from 'y-prosemirror';

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

const arrowExtensions = [
  StarterKit.configure({
    history: false,

    blockquote: false,

    code: false,
    codeBlock: false,

    bulletList: false,
    orderedList: false,
    listItem: false,

    horizontalRule: false,

    heading: false,
  }),

  Underline,

  TextAlign.configure({
    types: ['paragraph'],
  }),

  Subscript,
  Superscript,

  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      draggable: false,
    },
  }),
];

const noteExtensions = [
  StarterKit.configure({
    history: false,
    codeBlock: false,

    horizontalRule: false,
  }),

  HorizontalRule.extend({
    draggable: false,
  }).configure({
    HTMLAttributes: {
      draggable: false,
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
      draggable: false,
    },
  }),

  Image.extend({
    draggable: false,
  }).configure({
    inline: true,
    allowBase64: true,
    HTMLAttributes: {
      draggable: false,
    },
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

export function swapXmlFragments(frag1: Y.XmlFragment, frag2: Y.XmlFragment) {
  const json1 = yXmlFragmentToProsemirrorJSON(frag1);
  const json2 = yXmlFragmentToProsemirrorJSON(frag2);

  prosemirrorJSONToYXmlFragment(tiptap.noteSchema, json2, frag1);
  prosemirrorJSONToYXmlFragment(tiptap.noteSchema, json1, frag2);
}

const _tiptap = {
  arrowExtensions,
  noteExtensions,

  arrowSchema: getSchema(arrowExtensions),
  noteSchema: getSchema(noteExtensions),

  Collaboration,
  CollaborationCursor,
  EditorContent,
  useEditor,

  swapXmlFragments,

  ySyncPluginKey,
};

declare global {
  /* eslint-disable no-var */
  var tiptap: typeof _tiptap;
}

globalThis.tiptap = _tiptap;
