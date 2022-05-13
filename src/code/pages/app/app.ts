import 'src/code/pages/static/types';

import { UnwrapRef } from 'vue';

import { Factory } from '../static/composition-root';
import { refProp } from '../static/vue';
import { IPageReference } from './page/page';
import { AppSerialization } from './serialization';
import { AppTemplates, ITemplate } from './templates';

declare global {
  // eslint-disable-next-line no-var
  var __DEEP_NOTES__: {
    pages: Record<
      string,
      {
        zoom?: number;
      }
    >;
  };

  // eslint-disable-next-line no-var
  var $pages: PagesApp;
}

export interface IAppReact {
  pathPages: IPageReference[];
  recentPages: IPageReference[];
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;

  react: UnwrapRef<IAppReact>;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);

    this.react = refProp<IAppReact>(this, 'react', {
      pathPages: [],
      recentPages: [],
    });

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }

  async loadData(initialPageId: string) {
    const response = await $api.post<{
      pathPages: IPageReference[];
      recentPages: IPageReference[];

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/pages-data', {
      initialPageId,
    });

    this.react.pathPages = response.data.pathPages;
    this.react.recentPages = response.data.recentPages;

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }
}
