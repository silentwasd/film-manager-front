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

const items = ref<any[]>([]);

const searchTerm = ref<string>('');
const searchTermDebounced = refDebounced(searchTerm, 200);

async function search(query: string) {
    if (props.disabled)
        return;

    loading.value = true;

    const repo = typeof(props.repo) === 'function' ? props.repo() : props.repo;

    const formats = await repo.search(query, model.value && props.firstModelSearch ? model.value[props.firstModelSearch] : undefined);

    loading.value = false;

    // Nuxt UI v3 не поддерживает by="id": модель хранит объекты, а сравнение идёт по ссылке.
    // Переиспользуем ссылки уже выбранных значений для совпадающих id, чтобы выбор сравнивался по id.
    const selected = Array.isArray(model.value) ? model.value : (model.value ? [model.value] : []);

    items.value = formats.data.map((item: any) =>
        selected.find((value: any) => value && typeof value === 'object' && value.id === item.id) ?? item
    );
}

watch(searchTermDebounced, query => search(query));

onMounted(() => search(''));
</script>

<template>
    <USelectMenu v-model="model"
                 v-model:search-term="searchTerm"
                 :items="items"
                 :loading="loading"
                 :search-input="{ placeholder: searchablePlaceholder ?? 'Поиск...' }"
                 label-key="name"
                 :disabled="disabled"
                 :key="key">
        <template v-if="$slots.default" #item="{ item }">
            <slot :option="item"></slot>
        </template>

        <template v-if="$slots.label" #default="{ modelValue, open }">
            <slot name="label" :model-value="modelValue" :open="open"></slot>
        </template>

        <template #empty="{ searchTerm }">
            <template v-if="searchTerm">По запросу "{{ searchTerm }}" ничего не найдено.</template>
            <template v-else>Ничего не найдено</template>
        </template>
    </USelectMenu>
</template>

<style scoped>

</style>
