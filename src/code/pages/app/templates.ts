import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { IVec2, Vec2 } from '../static/vec2';
import { PagesApp } from './app';
import { ISerialNoteInput } from './serialization';

export interface ITemplate {
  id: string;
  name: string;
  visible: boolean;
  data: ISerialNoteInput;
}

export interface ITemplatesReact {
  list: ITemplate[];

  defaultId: string;
  default: ComputedRef<ITemplate>;

  popup: {
    visible: boolean;
    pos: IVec2;
  };
}

export class AppTemplates {
  readonly react: UnwrapNestedRefs<ITemplatesReact>;

  constructor(readonly app: PagesApp) {
    this.react = reactive({
      list: [] as ITemplate[],

      defaultId: null as any,
      default: computed(() => {
        return this.react.list.find(
          (template) => template.id === this.react.defaultId
        )!;
      }),

      popup: {
        visible: false,
        pos: new Vec2({ x: 0, y: 0 }),
      },
    });
  }

  showPopup(pos: Vec2) {
    this.react.popup.visible = true;
    this.react.popup.pos = pos;
  }
}
