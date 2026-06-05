<script setup lang="ts">
import CollectionRepository from "~/repos/CollectionRepository";
import type Collection from "~/resources/Collection";
import type PaginatedCollection from "~/types/PaginatedCollection";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Мои коллекции // ВКинопоиск',
    description  : 'Создавай тематические подборки и ранжируй фильмы в любом порядке.',
    ogTitle      : 'Мои коллекции // ВКинопоиск',
    ogDescription: 'Создавай тематические подборки и ранжируй фильмы в любом порядке.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const {name, page, perPage, sort, clearFilters} = useTabler('collections');

const repo                                = new CollectionRepository();
const {data: collections, status, refresh} = await repo.lazyList<PaginatedCollection<Collection>>(() => ({
    name          : name.value,
    page          : page.value,
    per_page      : perPage.value,
    sort_column   : sort.value.column,
    sort_direction: sort.value.direction,
}));

const columns = [
    {key: 'id', label: '#', sortable: true},
    {key: 'name', label: 'Название', sortable: true},
    {key: 'films_count', label: 'Фильмов'},
    {key: 'actions'},
];

function makeCollection(): Collection {
    return {id: 0, name: ''};
}

const editRow  = ref<Collection>();
const removing = ref<{ [key: string]: boolean }>({});
const toast    = useToast();

async function save(state: Collection) {
    if (state.id > 0) {
        await repo.update(state);
    } else {
        await repo.store(state);
    }
    await refresh();
}

async function remove(collection: Collection) {
    removing.value[collection.id] = true;

    try {
        await repo.remove(collection.id);
        await refresh();
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        removing.value[collection.id] = false;
    }
}
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="collections?.data ?? []"
                       :page-count="collections?.meta.per_page"
                       :total="collections?.meta.total"
                       :loading="status == 'pending'"
                       class="grow h-0"
                       v-model:page="page"
                       v-model:sort="sort">
            <template #filters>
                <UiTableSearch v-model="name"/>
                <UiTablePerPage v-model="perPage"/>
                <UiTableClearFilters @clear="clearFilters"/>
            </template>

            <template #actions>
                <UButton icon="i-heroicons-plus"
                         color="neutral"
                         variant="subtle"
                         @click="editRow = makeCollection()">
                    Создать
                </UButton>
            </template>

            <template #name-data="{row}">
                <NuxtLink class="hover:underline underline-offset-2 font-medium"
                          :to="`/catalog/collections/${row.id}`">
                    {{ row.name }}
                </NuxtLink>
            </template>

            <template #actions-data="{row}">
                <div class="flex items-center justify-end gap-2.5">
                    <UTooltip text="Открыть">
                        <UButton color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-arrow-right"
                                 square
                                 :to="`/catalog/collections/${row.id}`"/>
                    </UTooltip>

                    <UTooltip text="Переименовать">
                        <UButton color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-pencil-solid"
                                 square
                                 @click="editRow = row"/>
                    </UTooltip>

                    <UTooltip text="Удалить">
                        <UButton color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-trash-solid"
                                 :loading="removing[row.id] ?? false"
                                 @click="remove(row)"/>
                    </UTooltip>
                </div>
            </template>
        </UiSelectTable>
    </UiManagementMain>

    <ModalEditModel v-model="editRow" :save="save">
        <template #create-title>Новая коллекция</template>
        <template #edit-title="{state}">Переименовать коллекцию</template>

        <template #default="{state}">
            <UFormField label="Название" name="name" required>
                <UInput v-model="state.name"
                        placeholder="Лучшие боевики всех времён"
                        class="w-full"
                        :maxlength="255"/>
            </UFormField>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>
