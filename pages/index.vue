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

const filmRepo              = new FilmRepository();
const name                  = ref<string>('');
const slowName              = useThrottle(name, 500);
const page                  = ref<number>(1);
const {data: films, status} = await filmRepo.lazyList(() => ({
    name: slowName.value,
    page: page.value
}));

watch(slowName, () => page.value = 1);
</script>

<template>
    <UMain>
        <div class="font-roboto">
            <UContainer class="py-5 md:py-10">
                <UInput size="xl"
                        v-model="name"
                        placeholder="Найти фильм..."
                        class="mb-10"/>

                <div class="flex justify-center">
                    <UPagination v-model="page"
                                 class="mb-10"
                                 size="xl"
                                 :page-count="films?.meta.per_page"
                                 :total="films?.meta.total"/>
                </div>

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
                                <span class="text-gray-600 dark:text-gray-400 italic ms-1">{{
                                        film.release_date
                                    }}</span>
                            </p>
                        </div>
                    </NuxtLink>
                </div>

                <div class="flex justify-center">
                    <UPagination v-model="page"
                                 class="mt-10"
                                 size="xl"
                                 :page-count="films?.meta.per_page"
                                 :total="films?.meta.total"/>
                </div>
            </UContainer>
        </div>
    </UMain>
</template>

<style scoped>

</style>