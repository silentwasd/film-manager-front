<script setup lang="ts">
import FilmRepository from "~/repos/public/FilmRepository";
import {FilmCinemaStatus} from "~/types/enums/FilmCinemaStatus";

definePageMeta({
    layout: 'management'
});

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

const filmRepo      = new FilmRepository();
const {data: films} = await filmRepo.list(`films`);
</script>

<template>
    <UMain>
        <div class="font-roboto">
            <div class="h-[60dvh] bg-center bg-cover"
                 style="background-image: url('/img/cassettes.png');">
                <div
                    class="bg-gradient-to-r from-gray-950 via-transparent/10 to-gray-950 text-gray-50 h-full">
                    <UContainer class="flex flex-col items-center justify-center gap-5 h-full">
                        <h3 class="font-bold text-2xl md:text-4xl text-center drop-shadow-md">
                            Отслеживай просмотр<br>
                            и ставь собственные оценки
                        </h3>

                        <UButton label="Присоединиться"
                                 size="xl"
                                 color="gray"
                                 class="md:text-xl"
                                 to="/catalog/films"
                                 :ui="{rounded: 'rounded-xl', color: {gray: {solid: 'ring-0'}}}"/>
                    </UContainer>
                </div>
            </div>

            <UContainer class="py-5 md:py-10">
                <h3 class="font-bold text-2xl mb-5">Случайные фильмы</h3>

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    <NuxtLink class="block"
                              :to="`/catalog/films/${film.id}`"
                              v-for="film in films?.data ?? []">
                        <img v-if="film.cover"
                             :src="fileUrl(film.cover)"
                             :alt="film.name"
                             class="w-full h-[200px] md:h-[250px] object-contain bg-gradient-to-br from-gray-800 to-gray-950 rounded-lg"/>

                        <div class="mt-1.5">
                            <p class="truncate text-lg font-medium leading-5">{{ film.name }}</p>
                            <p class="font-light truncate text-sm">
                        <span>
                            {{ {film: 'Фильм', 'mini-series': 'Мини-сериал', series: 'Сериал'}[film.format] }}
                        </span>
                                <span class="text-gray-600 dark:text-gray-400 italic ms-1">{{ film.release_date }}</span>
                            </p>
                        </div>
                    </NuxtLink>
                </div>
            </UContainer>
        </div>
    </UMain>
</template>

<style scoped>

</style>