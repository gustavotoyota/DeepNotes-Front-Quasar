import { cloneDeep, pull } from 'lodash';
import { v4 } from 'uuid';
import {
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProsemirrorJSON,
} from 'y-prosemirror';
import { z } from 'zod';

import { PagesApp } from './app';
import { IArrowCollab } from './page/arrows/arrow';
import { INoteCollab } from './page/notes/note';
import { IRegionCollab } from './page/regions/region';

// Arrow

export const ISerialArrow = IArrowCollab.omit({
  sourceId: true,
  targetId: true,

  label: true,
}).extend({
  sourceIndex: z.number(),
  targetIndex: z.number(),

  label: z.object({
    enabled: z.boolean().default(false),
    value: z.any().default({
      type: 'doc',
      content: [],
    }),
  }),
});

// Note

export const ISerialTextSection = z.object({
  enabled: z.boolean(),
  value: z.any().default({
    type: 'doc',
    content: [],
  }),
  wrap: z.boolean().default(true),
  height: z
    .object({
      expanded: z.string().default('auto'),
      collapsed: z.string().default('auto'),
    })
    .default({}),
});

export interface ISerialNoteInput
  extends Omit<
      z.input<typeof INoteCollab>,
      'head' | 'body' | keyof z.input<typeof IRegionCollab> | 'zIndex'
    >,
    ISerialRegionInput {
  head?: z.input<typeof ISerialTextSection>;
  body?: z.input<typeof ISerialTextSection>;
}
export interface ISerialNoteOutput
  extends Omit<
      z.output<typeof INoteCollab>,
      'head' | 'body' | keyof z.output<typeof IRegionCollab> | 'zIndex'
    >,
    ISerialRegionOutput {
  head: z.output<typeof ISerialTextSection>;
  body: z.output<typeof ISerialTextSection>;
}

export const ISerialNote = z.lazy(() =>
  INoteCollab.omit({
    head: true,
    body: true,

    noteIds: true,
    arrowIds: true,

    zIndex: true,
  }).extend({
    head: ISerialTextSection.default({ enabled: true }),
    body: ISerialTextSection.default({ enabled: false }),

    notes: ISerialNote.array().default([]),
    arrows: ISerialArrow.array().default([]),
  })
) as z.ZodType<ISerialNoteOutput>;

// Region

export interface ISerialRegionInput {
  notes?: ISerialNoteInput[];
  arrows?: z.input<typeof ISerialArrow>[];
}
export interface ISerialRegionOutput {
  notes: ISerialNoteOutput[];
  arrows: z.output<typeof ISerialArrow>[];
}
export const ISerialRegion = z.lazy(() =>
  z.object({
    notes: ISerialNote.array().default([]),
    arrows: ISerialArrow.array().default([]),
  })
) as z.ZodType<ISerialRegionOutput, z.ZodTypeDef, ISerialRegionInput>;

export class AppSerialization {
  constructor(readonly app: PagesApp) {}

  serialize(
    container: z.output<typeof IRegionCollab>,
    parse = true
  ): ISerialRegionOutput {
    let serialRegion: ISerialRegionOutput = {
      notes: [],
      arrows: [],
    };

    const page = $pages.react.page;

    // Serialize notes

    const noteMap = new Map<string, number>();

    for (const note of page.notes.fromIds(container.noteIds)) {
      // Children

      const serialNote: Partial<ISerialNoteOutput> = this.serialize(
        note.collab
      );

      // Head and body

      serialNote.head = {
        enabled: note.collab.head.enabled,
        value: yXmlFragmentToProsemirrorJSON(note.collab.head.value),
        wrap: note.collab.head.wrap,
        height: cloneDeep(note.collab.head.height),
      };
      serialNote.body = {
        enabled: note.collab.body.enabled,
        value: yXmlFragmentToProsemirrorJSON(note.collab.body.value),
        wrap: note.collab.body.wrap,
        height: cloneDeep(note.collab.body.height),
      };

      // Rest of the properties

      const collabKeys = Object.keys(note.collab);

      pull(collabKeys, 'head', 'body', 'noteIds', 'arrowIds', 'zIndex');

      for (const collabKey of collabKeys) {
        // @ts-ignore
        serialNote[collabKey] = cloneDeep(note.collab[collabKey]);
      }

      noteMap.set(note.id, serialRegion.notes.length);

      serialRegion.notes.push(serialNote as ISerialNoteOutput);
    }

    // Serialize arrows

    for (const arrow of page.arrows.fromIds(container.arrowIds)) {
      if (
        !noteMap.has(arrow.collab.sourceId) ||
        !noteMap.has(arrow.collab.targetId)
      ) {
        continue;
      }

      const serialArrow: z.output<typeof ISerialArrow> = {
        ...arrow.collab,

        sourceIndex: noteMap.get(arrow.collab.sourceId)!,
        targetIndex: noteMap.get(arrow.collab.targetId)!,

        label: {
          enabled: arrow.collab.label.enabled,
          value: yXmlFragmentToProsemirrorJSON(arrow.collab.label.value),
        },
      };

      serialRegion.arrows.push(serialArrow);
    }

    if (parse) {
      serialRegion = ISerialRegion.parse(serialRegion);
    }

    return serialRegion;
  }

  private _deserializeAux(
    serialRegion: ISerialRegionOutput
  ): z.output<typeof IRegionCollab> {
    const page = $pages.react.page;

    const noteMap = new Map<number, string>();

    // Deserialize notes

    const noteIds = [];

    if (serialRegion.notes != null) {
      for (let i = 0; i < serialRegion.notes.length; i++) {
        const serialNote = serialRegion.notes[i];

        const noteCollab = {} as Partial<z.output<typeof INoteCollab>>;

        // Head and body

        noteCollab.head = {
          enabled: serialNote.head.enabled,
          value: prosemirrorJSONToYXmlFragment(
            tiptap.schema,
            serialNote.head.value
          ),
          wrap: serialNote.head.wrap,
          height: cloneDeep(serialNote.head.height),
        };
        noteCollab.body = {
          enabled: serialNote.body.enabled,
          value: prosemirrorJSONToYXmlFragment(
            tiptap.schema,
            serialNote.body.value
          ),
          wrap: serialNote.body.wrap,
          height: cloneDeep(serialNote.body.height),
        };

        // Rest of the keys

        const collabKeys = Object.keys(serialNote);

        pull(collabKeys, 'head', 'body', 'notes', 'arrows');

        for (const collabKey of collabKeys) {
          // @ts-ignore
          noteCollab[collabKey] = cloneDeep(serialNote[collabKey]);
        }

        noteCollab.zIndex = page.react.currentLayer.collab.nextZIndex++;

        // Children

        const deserializedChild = this._deserializeAux(serialNote);

        noteCollab.noteIds = deserializedChild.noteIds;
        noteCollab.arrowIds = deserializedChild.arrowIds;

        // Add note data to the store

        const noteId = v4();

        page.notes.react.collab[noteId] = noteCollab as z.output<
          typeof INoteCollab
        >;

        noteMap.set(i, noteId);

        noteIds.push(noteId);
      }
    }

    // Deserialize arrows

    const arrowIds = [];

    if (serialRegion.arrows != null) {
      for (const serialArrow of serialRegion.arrows) {
        const arrowCollab: IArrowCollab = {
          ...serialArrow,

          sourceId: noteMap.get(serialArrow.sourceIndex)!,
          targetId: noteMap.get(serialArrow.targetIndex)!,

          label: {
            enabled: serialArrow.label.enabled,
            value: prosemirrorJSONToYXmlFragment(
              tiptap.schema,
              serialArrow.label.value
            ),
          },
        };

        const arrowId = v4();

        page.arrows.react.collab[arrowId] = arrowCollab as IArrowCollab;

        arrowIds.push(arrowId);
      }
    }

    return { noteIds, arrowIds };
  }
  deserialize(
    serialRegion: ISerialRegionInput,
    destRegion: z.output<typeof IRegionCollab>,
    destIndex?: number | null,
    parse = true
  ): z.output<typeof IRegionCollab> {
    let result: z.output<typeof IRegionCollab> = { noteIds: [], arrowIds: [] };

    if (parse) {
      serialRegion = ISerialRegion.parse(serialRegion);
    }

    $pages.react.page.collab.doc.transact(() => {
      result = this._deserializeAux(serialRegion as ISerialRegionOutput);

      destIndex = destIndex ?? destRegion.noteIds.length;
      destRegion.noteIds.splice(destIndex, 0, ...result.noteIds);

      destRegion.arrowIds.push(...result.arrowIds);
    });

    return result;
  }
}
