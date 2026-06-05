<script setup lang="ts">
import type {TableColumn} from '@nuxt/ui';

type LegacyColumn = {
    key: string,
    label?: string,
    sortable?: boolean,
    class?: string
};

const props = defineProps<{
    columns: LegacyColumn[],
    rows: { [key: string]: any; }[],
    pageCount?: number,
    total?: number,
    loading?: boolean
}>();

const selected = defineModel<any[]>();

const page = defineModel<number>('page');

const sort = defineModel<{ column: string, direction: "desc" | "asc" }>('sort');

defineEmits<{
    (e: 'select', value: any): void
}>();

const slots = useSlots();

// Конвертируем «старые» колонки Nuxt UI v2 в column defs TanStack (Nuxt UI v3).
const tableColumns = computed<TableColumn<any>[]>(() => props.columns.map(column => ({
    id         : column.key,
    accessorKey: column.key,
    header     : column.label,
    meta       : {
        class: {
            th: column.class,
            td: column.class
        }
    }
})));

// Колонки, для которых страница предоставила кастомный слот ячейки (#[key]-data).
const dataColumns = computed(() => props.columns.filter(column => !!slots[`${column.key}-data`]));

const sortableColumns = computed(() => props.columns.filter(column => column.sortable));

function sortIcon(key: string): string {
    if (sort.value?.column !== key)
        return 'i-heroicons-arrows-up-down-20-solid';

    return sort.value.direction === 'asc'
        ? 'i-heroicons-bars-arrow-up-20-solid'
        : 'i-heroicons-bars-arrow-down-20-solid';
}

function toggleSort(key: string) {
    if (sort.value?.column === key) {
        sort.value = {
            column   : key,
            direction: sort.value.direction === 'asc' ? 'desc' : 'asc'
        };

        return;
    }

    sort.value = {column: key, direction: 'asc'};
}
</script>

<template>
    <div class="flex flex-col border rounded-md dark:border-neutral-700">
        <div v-if="$slots.filters" class="flex flex-wrap gap-2.5 border-b p-2.5 dark:border-b-gray-700 shrink-0">
            <slot name="filters"></slot>
        </div>

        <div v-if="$slots.actions" class="flex gap-2.5 justify-between p-2.5 border-b dark:border-b-gray-700 shrink-0">
            <div class="hidden lg:flex gap-2.5 items-center">
                <slot v-if="(selected && selected.length > 0) || !selected" name="selected"></slot>
            </div>
            <div class="flex gap-2.5 items-center">
                <slot name="actions"></slot>
            </div>
        </div>

        <div class="grow overflow-auto">
            <UTable :data="rows"
                    :columns="tableColumns"
                    :loading="loading"
                    empty="Нет записей"
                    class="h-full">
                <template v-for="column in sortableColumns"
                          :key="`header-${column.key}`"
                          #[`${column.key}-header`]>
                    <UButton :label="column.label"
                             color="neutral"
                             variant="ghost"
                             size="sm"
                             :trailing-icon="sortIcon(column.key)"
                             class="-mx-2.5"
                             @click="toggleSort(column.key)"/>
                </template>

                <template v-for="column in dataColumns"
                          :key="`cell-${column.key}`"
                          #[`${column.key}-cell`]="{ row }">
                    <slot :name="`${column.key}-data`" :row="row.original"></slot>
                </template>
            </UTable>
        </div>

        <div v-if="rows.length > 0" class="flex justify-between items-center border-t p-2.5 dark:border-t-gray-700 shrink-0">
            <div class="hidden md:block">
                <p v-if="total && ((selected && selected.length < 1) || !selected)" class="text-sm">Всего записей: {{ total }}</p>
                <p v-if="selected && selected.length > 0" class="text-sm">Выделено записей: {{ selected.length }}</p>
            </div>

            <div class="flex justify-center w-full md:justify-end md:w-auto">
                <UPagination v-if="page && pageCount && total"
                             v-model:page="page"
                             :items-per-page="pageCount"
                             :total="total"
                             :sibling-count="1"/>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
