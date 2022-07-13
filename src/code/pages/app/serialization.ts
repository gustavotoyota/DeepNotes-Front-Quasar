import { v4 } from 'uuid';
import {
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProsemirrorJSON,
} from 'y-prosemirror';
import { z } from 'zod';

import { PagesApp } from './app';
import {
  IArrowCollab,
  IArrowCollabInput,
  IArrowCollabOutput,
  PageArrow,
} from './page/arrows/arrow';
import {
  ILayerCollab,
  ILayerCollabInput,
  ILayerCollabOutput,
  PageLayer,
} from './page/layers/layer';
import { INoteCollab, INoteCollabInput, PageNote } from './page/notes/note';
import { IRegionElemIdsInput } from './page/regions/region';

// Arrow

export const ISerialArrow = IArrowCollab.omit({
  parentLayerId: true,

  sourceId: true,
  targetId: true,

  label: true,
}).extend({
  sourceIndex: z.number().optional(),
  targetIndex: z.number().optional(),

  label: z.any().default({
    type: 'doc',
    content: [],
  }),
});
export type ISerialArrowInput = z.input<typeof ISerialArrow>;
export type ISerialArrowOutput = z.output<typeof ISerialArrow>;

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
      expanded: z.string().default('Auto'),
      collapsed: z.string().default('Auto'),
    })
    .default({}),
});
export type ISerialTextSectionInput = z.input<typeof ISerialTextSection>;
export type ISerialTextSectionOutput = z.output<typeof ISerialTextSection>;

export const ISerialNote = z.lazy(() =>
  INoteCollab.omit({
    parentLayerId: true,

    head: true,
    body: true,

    layerIds: true,

    zIndex: true,
  }).extend({
    head: ISerialTextSection.default({ enabled: true }),
    body: ISerialTextSection.default({ enabled: false }),

    layerIndexes: z.number().array().default([]),
  })
);
export type ISerialNoteInput = z.input<typeof ISerialNote>;
export type ISerialNoteOutput = z.output<typeof ISerialNote>;

// Layer

export const ISerialLayer = ILayerCollab.omit({
  noteIds: true,
  arrowIds: true,

  nextZIndex: true,
}).extend({
  noteIndexes: z.number().array().default([]),
  arrowIndexes: z.number().array().default([]),
});
export type ISerialLayerInput = z.input<typeof ISerialLayer>;
export type ISerialLayerOutput = z.output<typeof ISerialLayer>;

// Object

export const ISerialObject = z.object({
  layers: ISerialLayer.array().default([]),
  notes: ISerialNote.array().default([]),
  arrows: ISerialArrow.array().default([]),
});
export type ISerialObjectInput = z.input<typeof ISerialObject>;
export type ISerialObjectOutput = z.output<typeof ISerialObject>;

export class SerializationMaps {
  layers = new Map<string, number>();
  notes = new Map<string, number>();
  arrows = new Map<string, number>();
}

export class AppSerialization {
  constructor(readonly app: PagesApp) {}

  // Input: objects to be serialized
  // Output: flat serialized representation of input

  serialize(input: IRegionElemIdsInput): ISerialObjectOutput {
    const result = ISerialObject.parse({});

    const maps = new SerializationMaps();

    this._serializeLayer(
      {
        id: 'root',
        react: {
          notes: $pages.react.page.notes.fromIds(input.noteIds ?? []),
          arrows: $pages.react.page.arrows.fromIds(input.arrowIds ?? []),
        },
      } as PageLayer,
      maps,
      result
    );

    return result;
  }
  private _serializeLayer(
    layer: PageLayer,
    maps: SerializationMaps,
    result: ISerialObjectOutput
  ): number {
    let layerIndex = maps.layers.get(layer.id);

    if (layerIndex != null) {
      return layerIndex;
    }

    const serialLayer: ISerialLayerOutput = ISerialLayer.parse({
      name: layer.react.collab?.name,

      noteIndexes: [],
      arrowIndexes: [],
    } as ISerialLayerInput);

    layerIndex = result.layers.length;

    result.layers.push(serialLayer);
    maps.layers.set(layer.id, layerIndex);

    for (const note of layer.react.notes) {
      const noteIndex = this._serializeNote(note, maps, result);

      serialLayer.noteIndexes.push(noteIndex);
    }

    for (const arrow of layer.react.arrows) {
      const arrowIndex = this.serializeArrow(arrow, maps, result);

      if (arrowIndex != null) {
        serialLayer.arrowIndexes.push(arrowIndex);
      }
    }

    return layerIndex;
  }
  private _serializeNote(
    note: PageNote,
    maps: SerializationMaps,
    result: ISerialObjectOutput
  ): number {
    let noteIndex = maps.notes.get(note.id);

    if (noteIndex != null) {
      return noteIndex;
    }

    const serialNote = ISerialNote.parse({
      ...note.react.collab,

      head: {
        ...note.react.collab.head,

        value: yXmlFragmentToProsemirrorJSON(note.react.collab.head.value),
      },
      body: {
        ...note.react.collab.body,

        value: yXmlFragmentToProsemirrorJSON(note.react.collab.body.value),
      },

      layerIndexes: [],
    });

    noteIndex = result.notes.length;

    result.notes.push(serialNote);
    maps.notes.set(note.id, noteIndex);

    for (const layer of note.react.layers) {
      const layerIndex = this._serializeLayer(layer, maps, result);

      serialNote.layerIndexes.push(layerIndex);
    }

    return noteIndex;
  }
  serializeArrow(
    arrow: PageArrow,
    maps: SerializationMaps,
    result: ISerialObjectOutput
  ): number | null {
    let arrowIndex = maps.arrows.get(arrow.id);

    if (arrowIndex != null) {
      return arrowIndex;
    }

    if (
      maps.notes.get(arrow.react.collab.sourceId!) == null ||
      maps.notes.get(arrow.react.collab.targetId!) == null
    ) {
      return null;
    }

    const serialArrow = ISerialArrow.parse({
      ...arrow.react.collab,

      sourceIndex: maps.notes.get(arrow.react.collab.sourceId!),
      targetIndex: maps.notes.get(arrow.react.collab.targetId!),

      label: yXmlFragmentToProsemirrorJSON(arrow.react.collab.label),
    });

    arrowIndex = result.arrows.length;

    result.arrows.push(serialArrow);
    maps.arrows.set(arrow.id, arrowIndex);

    return arrowIndex;
  }

  // Input: flat serialized representation of input
  // Result: objects deserialized from input

  deserialize(
    serialObjectInput: ISerialObjectInput,
    destLayer: PageLayer,
    destIndex?: number
  ): ILayerCollabOutput {
    const serialObjectOutput = ISerialObject.parse(serialObjectInput);

    let layerCollab: ILayerCollabOutput;

    $pages.react.page.collab.doc.transact(() => {
      layerCollab = this._deserializeLayer(
        serialObjectOutput.layers[0],
        destLayer.id,
        serialObjectOutput
      );

      destLayer.react.collab.noteIds.splice(
        destIndex ?? destLayer.react.collab.noteIds.length,
        0,
        ...layerCollab.noteIds
      );

      destLayer.react.collab.arrowIds.push(...layerCollab.arrowIds);
    });

    return layerCollab!;
  }
  private _deserializeLayer(
    serialLayer: ISerialLayerOutput,
    layerId: string,
    serialObject: ISerialObjectOutput
  ): ILayerCollabOutput {
    const layerCollab = ILayerCollab.parse({
      ...serialLayer,
    } as ILayerCollabInput);

    const noteMap = new Map<number, string>();

    for (const noteIndex of serialLayer.noteIndexes) {
      const noteId = this._deserializeNote(
        serialObject.notes[noteIndex],
        layerId,
        layerCollab,
        serialObject
      );

      layerCollab.noteIds.push(noteId);

      noteMap.set(noteIndex, noteId);
    }

    for (const arrowIndex of serialLayer.arrowIndexes) {
      const arrowCollab = this.deserializeArrow(
        serialObject.arrows[arrowIndex],
        layerId,
        noteMap
      );

      const arrowId = v4();

      $pages.react.page.arrows.react.collab[arrowId] = arrowCollab;

      layerCollab.arrowIds.push(arrowId);
    }

    return layerCollab;
  }
  private _deserializeNote(
    serialNote: ISerialNoteOutput,
    parentLayerId: string,
    parentLayerCollab: ILayerCollabOutput,
    serialObject: ISerialObjectOutput
  ): string {
    const noteCollab = INoteCollab.parse({
      ...serialNote,

      parentLayerId,

      head: {
        ...serialNote.head,

        value: prosemirrorJSONToYXmlFragment(
          tiptap.noteSchema,
          serialNote.head.value
        ),
      },
      body: {
        ...serialNote.body,

        value: prosemirrorJSONToYXmlFragment(
          tiptap.noteSchema,
          serialNote.body.value
        ),
      },

      zIndex: parentLayerCollab.nextZIndex++,
    } as INoteCollabInput);

    for (const layerIndex of serialNote.layerIndexes) {
      const layerId = v4();

      const layerCollab = this._deserializeLayer(
        serialObject.layers[layerIndex],
        layerId,
        serialObject
      );

      $pages.react.page.layers.react.collab[layerId] = layerCollab;

      noteCollab.layerIds.push(layerId);
    }

    const noteId = v4();

    $pages.react.page.notes.react.collab[noteId] = noteCollab;

    return noteId;
  }
  deserializeArrow(
    serialArrow: ISerialArrowOutput,
    parentLayerId: string,
    noteMap = new Map<number, string>()
  ): IArrowCollabOutput {
    return IArrowCollab.parse({
      ...serialArrow,

      parentLayerId,

      sourceId: noteMap.get(serialArrow.sourceIndex!),
      targetId: noteMap.get(serialArrow.targetIndex!),

      label: prosemirrorJSONToYXmlFragment(
        tiptap.arrowSchema,
        serialArrow.label
      ),
    } as IArrowCollabInput);
  }
}
