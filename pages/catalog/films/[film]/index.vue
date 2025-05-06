<script setup lang="ts">
import FilmRepository from "~/repos/FilmRepository";
import type Film from "~/resources/Film";
import {UserRole} from "~/types/enums/UserRole";
import {PersonRole} from "~/types/enums/PersonRole";
import type CountryResource from "~/resources/management/CountryResource";
import FeedbackRepository from "~/repos/FeedbackRepository";
import type TagResource from "~/resources/management/TagResource";
import {FilmFormat} from "~/types/enums/FilmFormat";

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

let title = `${filmFormat(filmData.value?.format ?? FilmFormat.Film)} "${filmData.value?.name}"`;

if (filmData.value?.produced_year) {
    title += `, ${filmData.value?.produced_year}`;
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
        <div v-if="filmData?.background_cover"
             class="bg-cover bg-no-repeat bg-top w-full h-[380px] absolute top-0"
             :style="`background-image: url(${fileUrl(filmData.background_cover as string)});`"></div>

        <div v-if="filmData?.background_cover"
             class="bg-gradient-to-t from-gray-900 from-30% absolute top-0 w-full h-[500px]"></div>

        <UContainer class="py-5 sm:py-10 relative z-10">
            <div v-if="filmData" class="flex flex-col sm:flex-row gap-10">
                <div class="shrink-0">
                    <div class="sm:sticky sm:top-[calc(var(--header-height)+2.5rem)] flex flex-col gap-2.5">
                        <img v-if="filmData.cover"
                             :src="fileUrl(filmData.cover)"
                             :alt="filmData.name"
                             class="block rounded-lg w-full sm:max-w-[250px] sm:max-h-[400px] border dark:border-gray-800/50"/>

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
                    <div class="flex flex-col gap-5">
                        <div>
                            <h1 class="font-black text-4xl leading-9">{{ filmData.name }}</h1>
                            <h3 v-if="filmData.original_name" class="font-medium text-xl text-gray-300 mt-1">
                                {{ filmData.original_name }}
                            </h3>
                        </div>

                        <UiFilmInfoTable :film="filmData"/>

                        <div>
                            <p v-for="p in filmData.description?.replaceAll('\r', '')?.split('\n') ?? []"
                               class="text-xl font-light mt-2.5 first-of-type:mt-0">
                                {{ p }}
                            </p>
                        </div>
                    </div>

                    <div v-if="filmData.people">
                        <div class="flex justify-between items-center">
                            <h1 class="font-bold text-2xl">
                                <span>Люди</span>
                                <span class="ms-1.5 text-gray-400 font-normal">{{ filmData.people.length }}</span>
                            </h1>
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