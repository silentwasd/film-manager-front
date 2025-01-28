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
import CompanyRepository from "~/repos/management/CompanyRepository";
import type CompanyResource from "~/resources/management/CompanyResource";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const route  = useRoute();
const config = useRuntimeConfig();

useSeoMeta({
    title        : 'ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'ВКинопоиск',
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

const editRow = ref<Film>();

const addRow = ref<Film>();

const ratingRow = ref<Film>();

watch(ratingRow, () => refresh());

watch(editRow, (value: Film | undefined) => {
    if (!value || !value.id)
        return;

    if (!editRow.value)
        return;

    editRow.value.genres    = value.genres?.map(genre => (genre as GenreResource).id) ?? [];
    editRow.value.countries = value.countries?.map(country => (country as CountryResource).id) ?? [];
    editRow.value.tags      = value.tags?.map(tag => (tag as TagResource).id) ?? [];
    editRow.value.companies = value.companies?.map(company => (company as CompanyResource).id) ?? [];
});

function makeResource(): Film {
    return {
        id           : 0,
        name         : '',
        original_name: '',
        format       : FilmFormat.Film,
        genres       : [],
        countries    : [],
        tags         : [],
        companies    : []
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
                <NuxtTime :datetime="row.release_date" date-style="short"/>
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
                    <UTooltip v-if="row.can_edit" text="Изменить">
                        <UButton color="gray"
                                 icon="i-heroicons-pencil-solid"
                                 square
                                 @click="editRow = {...row, cover: null}"/>
                    </UTooltip>

                    <UTooltip v-if="!row.is_mine"
                              text="В мои фильмы">
                        <UButton color="gray"
                                 icon="i-heroicons-arrow-right"
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
                    :save="(state: any) => state.id > 0 ? repo.update(state).then(() => refresh()) : repo.store(state).then(() => refresh())">
        <template #create-title>Новый фильм</template>
        <template #edit-title="{state}">Фильм #{{ state.id }}</template>

        <template #default="{state}">
            <UFormGroup label="Наименование" name="name" required>
                <UInput v-model="state.name" placeholder="Джек который построил дом"/>
            </UFormGroup>

            <UFormGroup label="Оригинальное наименование" name="original_name">
                <UInput v-model="state.original_name" placeholder="The Jack Who Built The House"/>
            </UFormGroup>

            <UFormGroup label="Формат" name="format" required>
                <USelectMenu v-model="state.format"
                             :options="formatOptions"
                             value-attribute="value"/>
            </UFormGroup>

            <UFormGroup label="Обложка" name="cover">
                <UInput type="file" @input="state.cover = $event.target.files[0]"/>
            </UFormGroup>

            <UFormGroup label="Дата выхода" name="release_date">
                <UInput type="date"
                        :model-value="state.release_date ? undater(state.release_date) : null"
                        @update:model-value="state.release_date = dater($event)"/>
            </UFormGroup>

            <UFormGroup label="Жанры" name="genres">
                <UiRepoSearchSelectId :repo="new GenreRepository()"
                                      placeholder="Выберите жанры из списка"
                                      multiple
                                      v-model="state.genres">
                    <template v-if="state.genres.length > 0" #label="{options}">
                        {{
                            state.genres.map(genre => options.find(option => genre == option.id)?.name ?? genre).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelectId>
            </UFormGroup>

            <UFormGroup label="Страны" name="countries">
                <UiRepoSearchSelectId :repo="new CountryRepository()"
                                      placeholder="Выберите страны из списка"
                                      multiple
                                      v-model="state.countries">
                    <template v-if="state.countries.length > 0" #label="{options}">
                        {{
                            state.countries.map(country => options.find(option => country == option.id)?.name ?? country).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelectId>
            </UFormGroup>

            <UFormGroup label="Теги" name="tags">
                <UiRepoSearchSelectId :repo="new TagRepository()"
                                      placeholder="Выберите теги из списка"
                                      multiple
                                      v-model="state.tags">
                    <template v-if="state.tags.length > 0" #label="{options}">
                        {{
                            state.tags.map(tag => options.find(option => tag == option.id)?.name ?? tag).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelectId>
            </UFormGroup>

            <UFormGroup label="Компании" name="companies">
                <UiRepoSearchSelectId :repo="new CompanyRepository()"
                                      placeholder="Выберите компании из списка"
                                      multiple
                                      v-model="state.companies">
                    <template v-if="state.companies.length > 0" #label="{options}">
                        {{
                            state.companies.map(company => options.find(option => company == option.id)?.name ?? company).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelectId>
            </UFormGroup>

            <UFormGroup label="Описание" name="description">
                <UTextarea v-model="state.description" autoresize :maxrows="10"/>
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