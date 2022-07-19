import { Y } from '@syncedstore/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { EditorContent, getSchema, useEditor } from '@tiptap/vue-3';
import {
  prosemirrorJSONToYXmlFragment,
  ySyncPluginKey,
  yXmlFragmentToProsemirrorJSON,
} from 'y-prosemirror';

import { arrowExtensions } from './arrow-extensions';
import { noteExtensions } from './note-extensions';

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