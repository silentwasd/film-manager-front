<script setup lang="ts">
import FilmWatcherRepository from "~/repos/FilmWatcherRepository";
import type PaginatedCollection from "~/types/PaginatedCollection";
import type FilmWatcher from "~/resources/FilmWatcher";
import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";
import PersonRepository from "~/repos/PersonRepository";
import {PersonRole} from "~/types/enums/PersonRole";
import GenreRepository from "~/repos/management/GenreRepository";
import CountryRepository from "~/repos/management/CountryRepository";
import {FilmFormat} from "~/types/enums/FilmFormat";
import useMultiQuery from "~/composables/use-multi-query";
import TagRepository from "~/repos/management/TagRepository";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const route  = useRoute();
const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Мои фильмы // ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'Мои фильмы // ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const watchStatus = ref<FilmWatchStatus | undefined>(route.query.status ? (route.query.status as FilmWatchStatus) : undefined);
const reaction    = ref<number | undefined>(route.query.reaction ? parseInt(route.query.reaction as string) : undefined);
const format      = ref<FilmFormat | undefined>(route.query.format ? (route.query.format as FilmFormat) : undefined);
const people      = useMultiQuery('people');
const genres      = useMultiQuery('genres')
const countries   = useMultiQuery('countries');
const tags        = useMultiQuery('tags');

const {name, page, perPage, sort, clearFilters} = useTabler('film_watchers', () => ({
    status   : watchStatus.value,
    reaction : reaction.value,
    format   : format.value,
    people   : people.value,
    genres   : genres.value,
    countries: countries.value,
    tags     : tags.value
}), () => {
    watchStatus.value = undefined;
    reaction.value    = undefined;
    format.value      = undefined;
    people.value      = [];
    genres.value      = [];
    countries.value   = [];
    tags.value        = [];
});

const filmWatcherRepo                       = new FilmWatcherRepository();
const {data: filmWatchers, status, refresh} = await filmWatcherRepo.lazyList<PaginatedCollection<FilmWatcher>>(() => ({
    name          : name.value,
    page          : page.value,
    per_page      : perPage.value,
    format        : format.value,
    people        : people.value,
    genres        : genres.value,
    countries     : countries.value,
    tags          : tags.value,
    sort_column   : sort.value.column,
    sort_direction: sort.value.direction,
    ...watchStatus.value ? {watch_status: watchStatus.value} : {},
    ...reaction.value !== undefined ? {reaction: reaction.value} : {}
}));

const columns = [
    {
        key     : 'id',
        label   : '#',
        sortable: true
    },
    {
        key     : 'film.name',
        label   : 'Наименование',
        sortable: true
    },
    {
        key     : 'film.format',
        label   : 'Формат',
        sortable: true
    },
    {
        key     : 'film.produced_year',
        label   : 'Год',
        sortable: true
    },
    {
        key  : 'status',
        label: 'Статус просмотра'
    },
    {
        key: 'actions'
    }
];

const removing = ref<{ [key: string]: boolean }>({});
const toast    = useToast();

async function remove(watcher: FilmWatcher) {
    removing.value[watcher.id] = true;

    try {
        await filmWatcherRepo.remove(watcher.id);
        await refresh();
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'red'
        });
    } finally {
        removing.value[watcher.id] = false;
    }
}
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="filmWatchers?.data ?? []"
                       :page-count="filmWatchers?.meta.per_page"
                       :total="filmWatchers?.meta.total"
                       :loading="status == 'pending'"
                       class="grow h-0"
                       v-model:page="page"
                       v-model:sort="sort">
            <template #filters>
                <UiTableSearch v-model="name"/>
                <UiTablePerPage v-model="perPage"/>
                <UiTableWatcherStatus placeholder="Статус просмотра"
                                      v-model="watchStatus"/>
                <UiTableReaction v-model="reaction"/>
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

            <template #actions></template>

            <template #film.name-data="{row}">
                <NuxtLink class="flex items-center gap-2.5 hover:underline underline-offset-2"
                          :to="`/catalog/films/${row.film.id}`">
                    <div v-if="row.film.cover"
                         class="bg-no-repeat bg-cover bg-center rounded w-8 h-8"
                         :style="`background-image: url(${fileUrl(row.film.cover)})`"></div>

                    <UIcon v-else name="i-heroicons-film" class="w-8 h-8"/>

                    <div>
                        <p class="font-semibold leading-4">
                            {{ row.film.name.length > 40 ? row.film.name.slice(0, 40) + '...' : row.film.name }}
                        </p>

                        <p v-if="row.film.people.length > 0" class="text-xs">
                            <UiPeopleShortText :people="row.film.people"/>
                        </p>
                    </div>
                </NuxtLink>
            </template>

            <template #film.format-data="{row}">
                {{ filmFormat(row.film.format) }}
            </template>

            <template #film.release_date-data="{row}">
                <NuxtTime v-if="row.film.release_date" :datetime="row.film.release_date" date-style="short"/>
                <p v-else class="italic">Не указана</p>
            </template>

            <template #status-data="{row}">
                <UiWatcherStatusUpdate :key="row.id" :watcher="row"/>
            </template>

            <template #actions-data="{row}">
                <div class="flex items-center justify-end gap-2.5">
                    <UTooltip text="Перейти">
                        <UButton color="gray"
                                 icon="i-heroicons-arrow-right"
                                 square
                                 :to="`/catalog/films/${row.film.id}`"/>
                    </UTooltip>

                    <UiFilmReaction :key="row.id" :film-id="row.film.id" :init-reaction="row.reaction"/>

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
</template>

<style scoped>

</style>