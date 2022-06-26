import { ComputedRef, UnwrapRef } from 'vue';
import { z } from 'zod';

import { PageArrow } from '../arrows/arrow';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export const IRegionCollab = z.object({
  noteIds: z.string().array().default([]),
  arrowIds: z.string().array().default([]),
});

export interface IRegionReact {
  collab: ComputedRef<z.output<typeof IRegionCollab>>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
}

export interface IPageRegion {
  page: AppPage;

  id: string;

  react: UnwrapRef<IRegionReact>;
}
