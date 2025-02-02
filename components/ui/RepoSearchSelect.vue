<script setup lang="ts">
import type SearchableRepository from "~/types/repos/SearchableRepository";

const props = defineProps<{
    repo: SearchableRepository | (() => SearchableRepository),
    disabled?: boolean,
    searchablePlaceholder?: string,
    firstModelSearch?: string
}>();

const key = ref<number>(0);

if (typeof(props.repo) === 'function') {
    const _repo = computed(props.repo);
    watch(_repo, () => {
        key.value++;
        model.value = undefined;
    });
}

const model = defineModel<string | number | boolean | Record<string, any> | unknown[] | undefined>();

const loading = ref<boolean>(false);

async function search(query: string) {
    if (props.disabled)
        return [];

    loading.value = true;

    const repo = typeof(props.repo) === 'function' ? props.repo() : props.repo;

    const formats = await repo.search(query, model.value && props.firstModelSearch ? model.value[props.firstModelSearch] : undefined);

    loading.value = false;

    return formats.data;
}
</script>

<template>
    <USelectMenu v-model="model"
                 :loading="loading"
                 :searchable="search"
                 :searchable-placeholder="searchablePlaceholder ?? 'Поиск...'"
                 option-attribute="name"
                 trailing
                 :disabled="disabled"
                 :key="key"
                 by="id">
        <template #option="{option}">
            <slot :option="option"></slot>
        </template>

        <template #label>
            <slot name="label"></slot>
        </template>

        <template #empty>
            Ничего не найдено
        </template>

        <template #option-empty="{query}">
            По запросу "{{ query }}" ничего не найдено.
        </template>
    </USelectMenu>
</template>

<style scoped>

</style>