import { Vec2 } from 'src/code/pages/static/vec2';
import { ComputedRef, UnwrapRef } from 'vue';
import { z, ZodType } from 'zod';

import { PageArrow } from '../arrows/arrow';
import { PageElem } from '../elems/elem';
import { PageLayer } from '../layers/layer';
import { PageNote } from '../notes/note';

export const IRegionCollab = z.object({
  layerIds: z.string().array().default([]),
});
export type IRegionCollabInput = z.input<typeof IRegionCollab>;
export type IRegionCollabOutput = z.output<typeof IRegionCollab>;

export const IRegionElemIds = z.object({
  noteIds: z.string().array().default([]),
  arrowIds: z.string().array().default([]),
});
export type IRegionElemIdsInput = z.input<typeof IRegionElemIds>;
export type IRegionElemIdsOutput = z.output<typeof IRegionElemIds>;

export const IRegionElems = z.object({
  notes: (z.any() as ZodType<PageNote>).array().default([]),
  arrows: (z.any() as ZodType<PageArrow>).array().default([]),
});
export type IRegionElemsInput = z.input<typeof IRegionElems>;
export type IRegionElemsOutput = z.output<typeof IRegionElems>;

export interface IRegionReact {
  collab: ComputedRef<IRegionCollabOutput>;

  layers: ComputedRef<PageLayer[]>;
  topLayer: ComputedRef<PageLayer>;
  activeLayerId?: string;
  activeLayer: ComputedRef<PageLayer>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
  elems: ComputedRef<PageElem[]>;
}

export interface IPageRegion {
  id: string;

  react: UnwrapRef<IRegionReact>;

  originElem: Element;

  get originClientPos(): Vec2;
}
