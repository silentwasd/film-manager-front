<script setup lang="ts">
import GenreRepository from "~/repos/public/GenreRepository";

definePageMeta({
    layout: 'management'
});

const config        = useRuntimeConfig();
const route         = useRoute();
const genreRepo     = new GenreRepository();
const genreSlug     = route.params.genre as string;
const {data: genre} = await genreRepo.show(genreSlug);

useSeoMeta({
    title        : `Жанр "${genre.value?.data.name}" // ВКинопоиск`,
    description  : genre.value?.data.description,
    ogTitle      : `Жанр "${genre.value?.data.name}" // ВКинопоиск`,
    ogDescription: genre.value?.data.description,
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});
</script>

<template>
    <UMain>
        <UContainer class="py-5">
            <div class="flex gap-5">
                <div class="flex w-20 h-20 bg-gradient-to-tr from-orange-700 to-fuchsia-400 rounded-xl shrink-0">
                    <UIcon v-if="genre?.data.icon" :name="genre?.data.icon" class="text-5xl m-auto"/>
                </div>

                <div class="grow w-0">
                    <h1 class="text-2xl font-semibold mb-1">{{ genre?.data.name }}</h1>
                    <p class="text-lg leading-6">{{ genre?.data.description }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-10">
                <NuxtLink class="block"
                          :to="`/catalog/films/${film.id}`"
                          v-for="film in genre?.data.films ?? []">
                    <img v-if="film.cover"
                         :src="fileUrl(film.cover)"
                         :alt="film.name"
                         class="w-full h-[200px] md:h-[250px] object-contain bg-gradient-to-br from-gray-800 to-gray-950 rounded-lg"/>

                    <div class="mt-1.5">
                        <p class="truncate text-lg font-medium leading-5">{{ film.name }}</p>
                        <p class="font-light truncate text-sm">
                        <span>
                            {{ filmFormat(film.format) }}
                        </span>
                            <span class="text-gray-600 dark:text-gray-400 italic ms-1">{{ film.release_date }}</span>
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>