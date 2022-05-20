<template>
  <q-btn
    dense
    flat
    :round="round"
    style="padding: 0"
    :style="{
      'min-width': round ? undefined : btnSize ?? '28px',
      height: btnSize ?? '28px',
      width: btnSize ?? '28px',
    }"
  >
    <q-icon
      :size="iconSize ?? '19px'"
      :name="icon"
    />

    <slot></slot>

    <q-tooltip
      anchor="bottom middle"
      self="top middle"
      :offset="[10, 10]"
    >
      {{ tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script
  setup
  lang="ts"
>
defineProps<{
  icon: string;
  tooltip: string;
  iconSize?: string;
  btnSize?: string;
  round?: boolean;
}>();
</script>
