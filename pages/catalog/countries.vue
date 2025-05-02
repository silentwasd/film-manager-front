<script setup lang="ts">
import CountryRepository from "~/repos/management/CountryRepository";
import type CountryResource from "~/resources/management/CountryResource";
import type PaginatedCollection from "~/types/PaginatedCollection";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Страны // ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'Страны // ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const {name, page, perPage, sort, clearFilters} = useTabler('countries');

const countryRepo                        = new CountryRepository();
const {data: countries, refresh, status} = await countryRepo.lazyList<PaginatedCollection<CountryResource>>(() => ({
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
        key     : 'films_count',
        label   : 'Фильмов',
        sortable: true
    },
    {
        key     : 'people_count',
        label   : 'Людей',
        sortable: true
    },
    {
        key: 'actions'
    }
];

const editRow  = ref<CountryResource>();
const removing = ref<{ [key: string]: boolean }>({});
const toast    = useToast();

function makeResource(): CountryResource {
    return {
        id  : 0,
        name: ''
    };
}

async function remove(country: CountryResource) {
    removing.value[country.id] = true;

    try {
        await countryRepo.remove(country.id);
        await refresh();
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'red'
        });
    } finally {
        removing.value[country.id] = false;
    }
}

async function save(state: any) {
    if (state.id > 0) {
        await countryRepo.update({...state});
    } else {
        await countryRepo.store(state);
    }

    await refresh();
}
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="countries?.data ?? []"
                       :page-count="countries?.meta.per_page"
                       :total="countries?.meta.total"
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
                         color="gray"
                         @click="editRow = makeResource()">
                    Создать
                </UButton>
            </template>

            <template #actions-data="{row}">
                <div class="flex items-center justify-end gap-2.5">
                    <UTooltip text="Изменить">
                        <UButton color="gray"
                                 icon="i-heroicons-pencil-solid"
                                 square
                                 @click="editRow = row"/>
                    </UTooltip>

                    <UTooltip text="Удалить">
                        <UButton color="gray"
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
        <template #create-title>Новая страна</template>
        <template #edit-title="{state}">Страна #{{ state.id }}</template>

        <template #default="{state}">
            <UFormGroup label="Наименование" name="name" required>
                <UInput v-model="state.name" placeholder="Россия"/>
            </UFormGroup>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>