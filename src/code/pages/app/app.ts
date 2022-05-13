import 'src/code/pages/static/types';

import { Factory } from '../static/composition-root';
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
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }

  async loadData(pageId: string) {
    const response = await $api.post<{
      pathPages: IPageReference[];
      recentPages: IPageReference[];

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/pages-data', {
      pageId,
    });

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }
}
