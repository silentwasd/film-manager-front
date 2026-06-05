<script setup lang="ts">
import GenreRepository from "~/repos/management/GenreRepository";
import type GenreResource from "~/resources/management/GenreResource";
import type PaginatedCollection from "~/types/PaginatedCollection";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Жанры // ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const {name, page, perPage, sort, clearFilters} = useTabler('genres');

const genreRepo                       = new GenreRepository();
const {data: genres, refresh, status} = await genreRepo.lazyList<PaginatedCollection<GenreResource>>(() => ({
    name          : name.value,
    page          : page.value,
    per_page      : perPage.value,
    sort_column   : sort.value.column,
    sort_direction: sort.value.direction
}));

const columns = [
    {
        key     : 'id',
        label   : '#',
        sortable: true
    },
    {
        key     : 'name',
        label   : 'Наименование',
        sortable: true
    },
    {
        key     : 'slug',
        label   : 'Slug'
    },
    {
        key     : 'films_count',
        label   : 'Фильмов',
        sortable: true
    },
    {
        key: 'actions'
    }
];

const editRow  = ref<GenreResource>();
const removing = ref<{ [key: string]: boolean }>({});
const toast    = useToast();

function makeResource(): GenreResource {
    return {
        id  : 0,
        name: ''
    };
}

async function remove(genre: GenreResource) {
    removing.value[genre.id] = true;

    try {
        await genreRepo.remove(genre.id);
        await refresh();
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        removing.value[genre.id] = false;
    }
}

async function save(state: any) {
    if (state.id > 0) {
        await genreRepo.update({...state});
    } else {
        await genreRepo.store(state);
    }

    await refresh();
}
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="genres?.data ?? []"
                       :page-count="genres?.meta.per_page"
                       :total="genres?.meta.total"
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
                         @click="editRow = makeResource()">
                    Создать
                </UButton>
            </template>

            <template #slug-data="{row}">
                <p v-if="row.slug">{{ row.slug }}</p>
                <p v-else class="italic">Не указан</p>
            </template>

            <template #actions-data="{row}">
                <div class="flex items-center justify-end gap-2.5">
                    <UTooltip text="Изменить">
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

    <ModalEditModel v-model="editRow"
                    :save="save">
        <template #create-title>Новый жанр</template>
        <template #edit-title>Жанр "{{ editRow?.name }}"</template>

        <template #default="{state}">
            <UFormField label="Наименование" name="name" required>
                <UInput v-model="state.name" placeholder="Комедия" class="w-full"/>
            </UFormField>

            <UFormField label="Slug" name="slug" required>
                <UInput v-model="state.slug" placeholder="comedy" class="w-full"/>
            </UFormField>

            <UFormField label="Иконка" name="icon">
                <UInput v-model="state.icon" placeholder="i-mdi-pistol" class="w-full"/>
            </UFormField>

            <UFormField label="Описание" name="description">
                <UTextarea v-model="state.description" placeholder="Это весело." class="w-full"/>
            </UFormField>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>