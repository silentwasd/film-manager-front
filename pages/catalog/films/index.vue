<script setup lang="ts">
import type Film from "~/resources/Film";
import {FilmFormat} from "~/types/enums/FilmFormat";
import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";
import FilmWatcherRepository from "~/repos/FilmWatcherRepository";
import FilmRepository from "~/repos/FilmRepository";
import type PaginatedCollection from "~/types/PaginatedCollection";
import type FilmPersonResource from "~/resources/FilmPersonResource";
import {PersonRole} from "~/types/enums/PersonRole";
import PersonRepository from "~/repos/PersonRepository";
import GenreRepository from "~/repos/management/GenreRepository";
import CountryRepository from "~/repos/management/CountryRepository";
import type GenreResource from "~/resources/management/GenreResource";
import type CountryResource from "~/resources/management/CountryResource";
import TagRepository from "~/repos/management/TagRepository";
import type TagResource from "~/resources/management/TagResource";
import type CompanyResource from "~/resources/management/CompanyResource";
import type Resource from "~/types/Resource";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const route  = useRoute();
const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Каталог // ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'Каталог // ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const repo = new FilmRepository();

const format    = ref<FilmFormat | undefined>(route.query.format ? (route.query.format as FilmFormat) : undefined);
const people    = useMultiQuery('people');
const genres    = useMultiQuery('genres')
const countries = useMultiQuery('countries');
const tags      = useMultiQuery('tags');

const {name, page, perPage, sort, clearFilters} = useTabler('films', () => ({
    format   : format.value,
    people   : people.value,
    genres   : genres.value,
    countries: countries.value,
    tags     : tags.value
}), () => {
    format.value    = undefined;
    people.value    = [];
    genres.value    = [];
    countries.value = [];
    tags.value      = [];
});

const {data: rows, refresh, status} = await repo.lazyList<PaginatedCollection<Film>>(() => ({
    name          : name.value,
    page          : page.value,
    per_page      : perPage.value,
    format        : format.value,
    people        : people.value,
    genres        : genres.value,
    countries     : countries.value,
    tags          : tags.value,
    sort_column   : sort.value.column,
    sort_direction: sort.value.direction
}));

let columns = [
    {
        key     : 'id',
        label   : '#',
        sortable: true
    },
    {
        key     : 'name',
        label   : 'Наименование',
        sortable: true,
    },
    {
        key     : 'release_date',
        label   : 'Дата выхода',
        sortable: true
    },
    {
        key  : 'genres',
        label: 'Жанры'
    },
    {
        key  : 'directors',
        label: 'Режиссёры'
    },
    {
        key  : 'actors',
        label: 'Актёры'
    },
    {
        key  : 'actions',
        class: 'w-auto'
    }
];

const removeRow = ref<Film>();
const removing  = ref<boolean>(false);

async function remove() {
    if (!removeRow.value)
        return;

    try {
        removing.value = true;

        await repo.remove(removeRow.value.id);

        await refresh();
    } finally {
        removing.value  = false;
        removeRow.value = undefined;
    }
}

async function save(state: Partial<Film>) {
    if (state.id && state.id > 0)
        return;

    const response = await repo.store<Resource<Film>>(state);
    await navigateTo(`/catalog/films/${response.data.id}/edit`);
}

const editRow = ref<Partial<Film>>();

const addRow = ref<Film>();

const ratingRow = ref<Film>();

watch(ratingRow, () => refresh());

watch(editRow, (value: Partial<Film> | undefined) => {
    if (!value || !value.id)
        return;

    if (!editRow.value)
        return;

    editRow.value.genres    = value.genres?.map(genre => (genre as GenreResource).id) ?? [];
    editRow.value.countries = value.countries?.map(country => (country as CountryResource).id) ?? [];
    editRow.value.tags      = value.tags?.map(tag => (tag as TagResource).id) ?? [];
    editRow.value.companies = value.companies?.map(company => (company as CompanyResource).id) ?? [];
});

function makeResource(): Partial<Film> {
    return {
        id    : 0,
        name  : '',
        format: FilmFormat.Film
    };
}

const watchStatusOptions = [
    {label: 'Можно посмотреть', value: FilmWatchStatus.ToWatch},
    {label: 'Нужно досмотреть', value: FilmWatchStatus.MustFinish},
    {label: 'Просмотрено', value: FilmWatchStatus.Watched},
    {label: 'Пропущено', value: FilmWatchStatus.Dropped},
];

const formatOptions = Object.keys(FilmFormat).map(key => ({
    label: filmFormat(FilmFormat[key]),
    value: FilmFormat[key]
}));

const filmWatcherRepo = new FilmWatcherRepository();
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="rows?.data ?? []"
                       :page-count="rows?.meta.per_page"
                       :total="rows?.meta.total"
                       :loading="status == 'pending'"
                       class="grow h-0"
                       v-model:page="page"
                       v-model:sort="sort">
            <template #filters>
                <UiTableSearch v-model="name"/>
                <UiTablePerPage v-model="perPage"/>
                <UiTableClearFilters @clear="clearFilters"/>
            </template>

            <template #selected>
                <UiRepoSearchSelectId :repo="new PersonRepository()"
                                      placeholder="Фильтр по личностям"
                                      multiple
                                      class="w-[250px]"
                                      v-model="people">
                    <template #default="{option}">
                        <div class="flex items-center gap-2">
                            <img :src="option.photo ? fileUrl(option.photo) : '/img/person.jpg'"
                                 class="w-10 h-10 object-cover rounded shrink-0"/>

                            <div class="grow">
                                <p class="font-medium leading-4">{{ option.name }}</p>
                                <p class="text-xs">{{ option.roles.map(role => personRole(role)).join(', ') }}</p>
                            </div>
                        </div>
                    </template>
                </UiRepoSearchSelectId>

                <UiTableFilmFormatStatus placeholder="Формат фильма" v-model="format"/>

                <UiRepoSearchSelectId :repo="new GenreRepository()"
                                      placeholder="Фильтр по жанрам"
                                      multiple
                                      v-model="genres"/>

                <UiRepoSearchSelectId :repo="new CountryRepository()"
                                      placeholder="Фильтр по странам"
                                      multiple
                                      v-model="countries"/>

                <UiRepoSearchSelectId :repo="new TagRepository()"
                                      placeholder="Фильтр по тегам"
                                      multiple
                                      v-model="tags"/>
            </template>

            <template #actions>
                <UButton icon="i-heroicons-plus"
                         color="gray"
                         @click="editRow = makeResource()">
                    Создать
                </UButton>
            </template>

            <template #name-data="{row}">
                <NuxtLink class="flex items-center gap-2.5 hover:underline"
                          :to="`/catalog/films/${row.id}`">
                    <div v-if="row.cover"
                         class="bg-no-repeat bg-cover bg-center rounded w-8 h-8 shrink-0"
                         :style="`background-image: url(${config.public.storageUrl}/${row.cover})`"></div>

                    <UIcon v-else name="i-heroicons-film" class="w-8 h-8 shrink-0"/>

                    <div>
                        <p class="leading-4 font-semibold line-clamp-1 text-wrap">
                            {{ row.name }}
                        </p>

                        <p class="text-xs leading-4 line-clamp-1 text-wrap">
                            {{ filmFormat(row.format) }}
                            <span v-if="row.countries.length > 0">({{
                                    row.countries.map((country: CountryResource) => country.name).join(', ')
                                }})</span>
                        </p>
                    </div>
                </NuxtLink>
            </template>

            <template #genres-data="{row}">
                <p class="line-clamp-2 text-wrap max-w-[100px] leading-4">
                    {{ row.genres.map((genre: GenreResource) => genre.name).join(', ') }}
                </p>
            </template>

            <template #release_date-data="{row}">
                <NuxtTime v-if="row.release_date" :datetime="row.release_date" date-style="short"/>
                <p v-else class="italic">Не указана</p>
            </template>

            <template #directors-data="{row}">
                <div>
                    <div
                        v-for="item in row.people.filter((item: FilmPersonResource) => item.role == PersonRole.Director).slice(0, 2)"
                        :key="item.id">
                        <p class="leading-4">{{ item.person.name }}</p>
                    </div>
                </div>
            </template>

            <template #actors-data="{row}">
                <div>
                    <div
                        v-for="item in row.people.filter((item: FilmPersonResource) => [PersonRole.Actor, PersonRole.VoiceActor].includes(item.role)).slice(0, 2)"
                        :key="item.id">
                        <p class="leading-4">{{ item.person.name }}</p>
                    </div>
                </div>
            </template>

            <template #actions-data="{row}">
                <div class="flex gap-2.5 justify-end">
                    <UTooltip text="Перейти">
                        <UButton color="gray"
                                 icon="i-heroicons-arrow-right"
                                 square
                                 :to="`/catalog/films/${row.id}`"/>
                    </UTooltip>

                    <UTooltip v-if="row.can_edit" text="Изменить">
                        <UButton color="gray"
                                 icon="i-heroicons-pencil-solid"
                                 square
                                 :to="`/catalog/films/${row.id}/edit`"/>
                    </UTooltip>

                    <UTooltip v-if="!row.is_mine"
                              text="В мои фильмы">
                        <UButton color="gray"
                                 icon="i-heroicons-plus"
                                 square
                                 @click="addRow = row"/>
                    </UTooltip>

                    <UTooltip v-else
                              text="Мой фильм">
                        <UButton color="gray"
                                 disabled
                                 icon="i-heroicons-check-circle-16-solid"
                                 square/>
                    </UTooltip>

                    <UTooltip v-if="row.can_edit" text="Удалить">
                        <UButton color="gray"
                                 icon="i-heroicons-trash-solid"
                                 square
                                 @click="removeRow = row"/>
                    </UTooltip>
                </div>
            </template>
        </UiSelectTable>
    </UiManagementMain>

    <ModalRemoveConfirm :opened="!!removeRow"
                        @confirm="remove"
                        @cancel="!removing ? removeRow = undefined : null"
                        :removing="removing"/>

    <ModalEditModel v-model="editRow"
                    :readonly="!(editRow?.can_edit ?? true)"
                    :save="save">
        <template #create-title>Новый фильм</template>
        <template #edit-title="{state}">Фильм #{{ state.id }}</template>

        <template #default="{state}">
            <UFormGroup label="Наименование" name="name" required>
                <UInput v-model="state.name" placeholder="Джек который построил дом"/>
            </UFormGroup>

            <UFormGroup label="Формат" name="format" required>
                <USelectMenu v-model="state.format"
                             :options="formatOptions"
                             value-attribute="value"/>
            </UFormGroup>
        </template>
    </ModalEditModel>

    <ModalEditModel v-model="addRow"
                    :save="(state: any) => filmWatcherRepo.store({film_id: addRow.id, status: state.status}).then(() => refresh())">
        <template #edit-title="{state}">Фильм #{{ state.id }}</template>

        <template #default="{state}">
            <UFormGroup label="Статус просмотра" name="status">
                <USelectMenu :options="watchStatusOptions"
                             value-attribute="value"
                             placeholder="Выберите статус из списка"
                             v-model="state.status"/>
            </UFormGroup>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>