import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';

export const arrowExtensions = [
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
