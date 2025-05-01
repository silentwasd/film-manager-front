<script setup lang="ts">
import FilmRepository from "~/repos/FilmRepository";
import type Film from "~/resources/Film";
import FilmPeopleEdit from "~/components/ui/FilmPeopleEdit.vue";
import {UserRole} from "~/types/enums/UserRole";
import {PersonRole} from "~/types/enums/PersonRole";
import type GenreResource from "~/resources/management/GenreResource";
import type CountryResource from "~/resources/management/CountryResource";
import FeedbackRepository from "~/repos/FeedbackRepository";
import type TagResource from "~/resources/management/TagResource";
import type CompanyResource from "~/resources/management/CompanyResource";

definePageMeta({
    layout: 'management'
});

const route            = useRoute();
const config           = useRuntimeConfig();
const filmId           = parseInt(route.params.film as string);
const filmRepo         = new FilmRepository();
const {state: profile} = useProfile();

const {data: film, refresh} = await filmRepo.show(`film.${filmId}`, filmId);

const filmData = computed<Film | null>(() => film.value?.data || null);
const director = computed<string | undefined | null>(() => filmData.value?.people?.find(person => person.role == PersonRole.Director)?.person?.name);
const actor    = computed<string | undefined | null>(() => filmData.value?.people?.find(person => person.role == PersonRole.Actor)?.person?.name);

let title = 'Фильм ' + filmData.value?.name;

if (filmData.value?.release_date) {
    title += `, ${new Date(filmData.value.release_date).getFullYear()}`;
}

if (filmData.value?.original_name) {
    title += ` (${filmData.value.original_name})`;
}

useSeoMeta({
    title        : `${title} // ВКинопоиск`,
    description  : filmData.value?.description,
    ogTitle      : `${title} // ВКинопоиск`,
    ogDescription: filmData.value?.description,
    ogImage      : filmData.value?.cover
                   ? fileUrl(filmData.value.cover as string)
                   : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl + '/catalog/films/' + filmData.value?.id,
    ogType       : 'video.movie',
    ...director.value ? {ogDirector: director.value} : {},
    ...actor.value ? {ogActor: actor.value} : {},
    ...filmData.value?.release_date ? {ogRelease_date: new Date(filmData.value.release_date).toISOString().slice(0, 10)} : {},
    ogLocale  : 'ru_RU',
    ogSiteName: 'ВКинопоиск'
});

const feedbackRepo = new FeedbackRepository(filmId);
const {
          data   : feedback,
          refresh: refreshFeedback
      }            = await feedbackRepo.list(`film.${filmId}.feedback`);
</script>

<template>
    <UMain>
        <UContainer class="py-5">
            <div v-if="filmData" class="flex flex-col sm:flex-row gap-5">
                <div class="shrink-0">
                    <div class="sm:sticky sm:top-20 flex flex-col gap-2.5">
                        <img v-if="filmData.cover"
                             :src="fileUrl(filmData.cover)"
                             :alt="filmData.name"
                             class="block rounded-lg w-full sm:max-w-[250px] sm:max-h-[400px] border dark:border-gray-800"/>

                        <div v-else
                             class="flex items-center justify-center rounded-lg w-full sm:w-[250px] h-[400px] border dark:border-gray-800">
                            <UIcon name="i-heroicons-film" class="text-8xl"/>
                        </div>

                        <BlockReactions v-if="(feedback?.data ?? []).filter(item => item.reaction != 0).length > 0"
                                        :items="feedback?.data ?? []"/>

                        <LazyUiWatcherStatusCreateOrUpdate v-if="profile" :film-id="filmData.id"/>

                        <UButton v-else
                                 color="gray"
                                 label="В мои фильмы"
                                 icon="i-heroicons-plus"
                                 class="w-full"
                                 @click="backAfterLogin()"/>

                        <UButton
                            v-if="profile?.role == UserRole.Admin || (filmData.author_id && filmData.author_id == profile?.id)"
                            color="gray"
                            label="Редактировать"
                            icon="i-heroicons-pencil-solid"
                            :to="`/catalog/films/${filmData.id}/edit`"/>
                    </div>
                </div>

                <div class="flex flex-col font-roboto gap-10 grow">
                    <div class="flex flex-col">
                        <h1 class="font-black text-4xl leading-9">{{ filmData.name }}</h1>
                        <h3 v-if="filmData.original_name" class="font-medium text-xl text-gray-400 leading-9">
                            {{ filmData.original_name }}
                        </h3>

                        <table class="mt-2.5 text-lg">
                            <tbody>
                            <tr>
                                <td class="w-[150px] font-medium">Формат</td>
                                <td>{{ filmFormat(filmData.format) }}</td>
                            </tr>
                            <tr v-if="filmData.release_date">
                                <td class="font-medium">Дата выхода</td>
                                <td>
                                    <NuxtTime :datetime="filmData.release_date"/>
                                </td>
                            </tr>
                            <tr v-if="(filmData.genres ?? []).length > 0">
                                <td class="font-medium">Жанр</td>
                                <td>
                                    <template v-for="(genre, index) in filmData.genres">
                                        {{ index > 0 ? ', ' : ''}}
                                        <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                                                  :to="`/genres/${genre.slug}`">
                                            {{ index > 0 ? genre.name.toLowerCase() : genre.name }}
                                        </NuxtLink>
                                    </template>
                                </td>
                            </tr>
                            <tr v-if="(filmData.countries ?? []).length > 0">
                                <td class="font-medium">Страна</td>
                                <td>
                                    {{
                                        filmData.countries?.map((country) => (country as CountryResource).name)?.join(', ')
                                    }}
                                </td>
                            </tr>
                            <tr v-if="(filmData.tags ?? []).length > 0">
                                <td class="font-medium">Теги</td>
                                <td>
                                    {{
                                        filmData.tags?.map((tag) => (tag as TagResource).name)?.join(', ')
                                    }}
                                </td>
                            </tr>
                            <tr v-if="(filmData.companies ?? []).length > 0">
                                <td class="font-medium">Компания</td>
                                <td>
                                    <template v-for="(company, index) in filmData.companies">
                                        {{ index > 0 ? ', ' : ''}}
                                        <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                                                  :to="`/catalog/companies/${(company as CompanyResource).id}`">
                                            {{ (company as CompanyResource).name }}
                                        </NuxtLink>
                                    </template>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <p v-for="p in filmData.description?.replaceAll('\r', '')?.split('\n') ?? []"
                           class="text-xl font-light mt-2.5">
                            {{ p }}
                        </p>
                    </div>

                    <div v-if="filmData.people">
                        <div class="flex justify-between items-center">
                            <h1 class="font-bold text-2xl">Люди</h1>
                        </div>

                        <BlockPeople v-if="filmData.people.length > 0"
                                     :people="filmData.people"/>

                        <p v-else>Людей здесь нет.</p>
                    </div>

                    <BlockFeedback :film-id="filmId" :items="feedback?.data ?? []" :refresh="refreshFeedback"/>
                </div>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>
</style>