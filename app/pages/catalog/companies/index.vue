<script setup lang="ts">
import type PaginatedCollection from "~/types/PaginatedCollection";
import CompanyRepository from "~/repos/management/CompanyRepository";
import type CompanyResource from "~/resources/management/CompanyResource";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Компании // ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'Компании // ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const {name, page, perPage, sort, clearFilters} = useTabler('companies');

const companyRepo                     = new CompanyRepository();
const {data: people, status, refresh} = await companyRepo.lazyList<PaginatedCollection<CompanyResource>>(() => ({
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
        key: 'actions'
    }
];

const editRow  = ref<CompanyResource>();
const removing = ref<{ [key: string]: boolean }>({});
const toast    = useToast();

function makeResource(): CompanyResource {
    return {
        id         : 0,
        name       : '',
        description: '',
        link       : ''
    };
}

async function remove(company: CompanyResource) {
    removing.value[company.id] = true;

    try {
        await companyRepo.remove(company.id);
        await refresh();
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        removing.value[company.id] = false;
    }
}

async function save(state: any) {
    if (state.id > 0) {
        await companyRepo.update(state);
    } else {
        await companyRepo.store(state);
    }

    await refresh();
}
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="people?.data ?? []"
                       :page-count="people?.meta.per_page"
                       :total="people?.meta.total"
                       :loading="status == 'pending'"
                       class="grow h-0"
                       v-model:page="page"
                       v-model:sort="sort">
            <template #filters>
                <UiTableSearch v-model="name"/>
                <UiTablePerPage v-model="perPage"/>
                <UiTableClearFilters @clear="clearFilters"/>
            </template>

            <template #name-data="{row}">
                <NuxtLink class="hover:underline"
                          :to="`/catalog/companies/${row.id}`">
                    {{ row.name }}
                </NuxtLink>
            </template>

            <template #actions>
                <UButton icon="i-heroicons-plus"
                         color="neutral"
                         variant="subtle"
                         @click="editRow = makeResource()">
                    Создать
                </UButton>
            </template>

            <template #actions-data="{row}">
                <div class="flex items-center justify-end gap-2.5">
                    <UTooltip v-if="row.link" text="Перейти на сайт">
                        <UButton color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-globe-alt-solid"
                                 square
                                 target="_blank"
                                 :to="row.link"/>
                    </UTooltip>

                    <UTooltip v-if="row.can_edit" text="Изменить">
                        <UButton color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-pencil-solid"
                                 square
                                 @click="editRow = row"/>
                    </UTooltip>

                    <UTooltip v-if="row.can_edit" text="Удалить">
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
                    :readonly="!(editRow?.can_edit ?? true)"
                    :save="save">
        <template #create-title>Новая компания</template>
        <template #edit-title="{state}">Компания #{{ state.id }}</template>

        <template #default="{state}">
            <UFormField label="Наименование" name="name" required>
                <UInput v-model="state.name" placeholder="Водород" class="w-full"/>
            </UFormField>

            <UFormField label="Описание" name="description">
                <UTextarea v-model="state.description"
                           autoresize
                           :maxrows="10"
                           class="w-full"
                           placeholder="Как вода, но водород."/>
            </UFormField>

            <UFormField label="Ссылка на сайт" name="link">
                <UInput v-model="state.link" placeholder="https://example.com" class="w-full"/>
            </UFormField>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>