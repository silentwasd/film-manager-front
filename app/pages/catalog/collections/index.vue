<script setup lang="ts">
import CollectionRepository from "~/repos/CollectionRepository";
import type Collection from "~/resources/Collection";
import {CollectionVisibility} from "~/types/enums/CollectionVisibility";
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
    {key: 'visibility', label: 'Доступ'},
    {key: 'films_count', label: 'Фильмов'},
    {key: 'actions'},
];

function makeCollection(): Collection {
    return {id: 0, name: '', description: '', visibility: CollectionVisibility.Hidden};
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

// --- Смена уровня доступа ---
const changing = ref<{ [key: number]: boolean }>({});

const visibilityOptions = Object.values(CollectionVisibility).map(value => {
    const meta = collectionVisibility(value);

    return {
        value,
        label      : meta.label,
        description: meta.hint
    };
});

// Три уровня не ложатся на кнопку-тумблер, поэтому в строке — меню.
function visibilityMenu(collection: Collection) {
    return [Object.values(CollectionVisibility).map(value => {
        const meta = collectionVisibility(value);

        return {
            label   : meta.label,
            icon    : meta.icon,
            disabled: collection.visibility === value,
            onSelect: () => changeVisibility(collection, value)
        };
    })];
}

async function changeVisibility(collection: Collection, visibility: CollectionVisibility) {
    if (collection.visibility === visibility) {
        return;
    }

    changing.value[collection.id] = true;

    try {
        await repo.update({...collection, visibility});
        await refresh();

        toast.add({title: `Доступ изменён: ${collectionVisibility(visibility).label.toLowerCase()}`});
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        changing.value[collection.id] = false;
    }
}

async function copyLink(collection: Collection) {
    if (!collection.public_url) {
        return;
    }

    try {
        await navigator.clipboard.writeText(collection.public_url);
        toast.add({title: 'Ссылка скопирована'});
    } catch {
        toast.add({
            title      : 'Не удалось скопировать',
            description: collection.public_url,
            color      : 'error'
        });
    }
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

            <template #visibility-data="{row}">
                <UTooltip :text="collectionVisibility(row.visibility).hint">
                    <UBadge :color="collectionVisibility(row.visibility).color"
                            variant="subtle"
                            :icon="collectionVisibility(row.visibility).icon">
                        {{ collectionVisibility(row.visibility).label }}
                    </UBadge>
                </UTooltip>
            </template>

            <template #actions-data="{row}">
                <div class="flex items-center justify-end gap-2.5">
                    <UTooltip v-if="row.public_url" text="Скопировать ссылку">
                        <UButton color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-link-20-solid"
                                 square
                                 @click="copyLink(row)"/>
                    </UTooltip>

                    <UDropdownMenu :items="visibilityMenu(row)">
                        <UTooltip text="Изменить доступ">
                            <UButton color="neutral"
                                     variant="subtle"
                                     :icon="collectionVisibility(row.visibility).icon"
                                     square
                                     :loading="changing[row.id] ?? false"/>
                        </UTooltip>
                    </UDropdownMenu>

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
        <template #edit-title="{state}">Коллекция «{{ state.name }}»</template>

        <template #default="{state}">
            <UFormField label="Название" name="name" required>
                <UInput v-model="state.name"
                        placeholder="Лучшие боевики всех времён"
                        class="w-full"
                        :maxlength="255"/>
            </UFormField>

            <UFormField label="Описание" name="description"
                        help="Показывается в шапке публичной страницы и в превью ссылки.">
                <UTextarea v-model="state.description"
                           placeholder="Подборка на вечер, от самого динамичного к самому спокойному."
                           class="w-full"
                           :rows="3"
                           :maxlength="2000"/>
            </UFormField>

            <UFormField label="Доступ" name="visibility"
                        :help="collectionVisibility(state.visibility).hint">
                <URadioGroup v-model="state.visibility"
                             :items="visibilityOptions"
                             variant="card"
                             class="w-full"/>
            </UFormField>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>
