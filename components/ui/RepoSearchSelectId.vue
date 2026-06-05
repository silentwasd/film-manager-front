<script setup lang="ts">
import type SearchableRepository from "~/types/repos/SearchableRepository";

const props = defineProps<{
    repo: SearchableRepository,
    placeholder?: string,
    searchablePlaceholder?: string
}>();

const model = defineModel<string | number | boolean | Record<string, any> | unknown[] | undefined>();

const loading = ref<boolean>(false);

const items = ref<any[]>([]);

const searchTerm = ref<string>('');
const searchTermDebounced = refDebounced(searchTerm, 200);

async function search(query: string) {
    loading.value = true;

    const formats = await props.repo.search(query, model.value);

    loading.value = false;

    items.value = formats.data;
}

watch(searchTermDebounced, query => search(query));

onMounted(() => search(''));
</script>

<template>
    <USelectMenu v-model="model"
                 v-model:search-term="searchTerm"
                 :items="items"
                 :loading="loading"
                 :placeholder="placeholder"
                 :search-input="{ placeholder: searchablePlaceholder ?? 'Поиск...' }"
                 label-key="name"
                 value-key="id"
                 ignore-filter>
        <template v-if="$slots.default" #item="{ item }">
            <slot :option="item"></slot>
        </template>

        <template #empty="{ searchTerm }">
            <template v-if="searchTerm">По запросу "{{ searchTerm }}" ничего не найдено.</template>
            <template v-else>Ничего не найдено</template>
        </template>
    </USelectMenu>
</template>

<style scoped>

</style>
