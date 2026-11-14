<script setup lang="ts">
import type Film from "~/resources/Film";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

/**
 * Блок «Тайтлы» на страницах студии и франшизы: заголовок со счётчиком,
 * переключатель «Таймлайн / Сетка» и сам вид.
 */
defineProps<{
    films: Film[];
    // film_id => статус просмотра текущего пользователя; пусто — гость
    statuses?: Record<number, FilmWatchStatus>;
}>();

const viewOptions = [
    {value: 'timeline', label: 'Таймлайн', icon: 'i-lucide-git-branch'},
    {value: 'grid', label: 'Сетка', icon: 'i-lucide-layout-grid'}
] as const;

const view = ref<'timeline' | 'grid'>('timeline');
</script>

<template>
    <template v-if="films.length > 0">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
            <h1 class="font-bold text-2xl">
                <span>Тайтлы</span>
                <span class="ms-1.5 text-neutral-400 font-normal">{{ films.length }}</span>
            </h1>

            <div class="flex gap-2.5">
                <UButton v-for="option in viewOptions"
                         :key="option.value"
                         :color="view == option.value ? 'primary' : 'neutral'"
                         :variant="view == option.value ? 'solid' : 'soft'"
                         :icon="option.icon"
                         :label="option.label"
                         @click="view = option.value"/>
            </div>
        </div>

        <UiFilmTimeline v-if="view == 'timeline'"
                        :films="films"
                        :statuses="statuses"/>

        <div v-else class="flex flex-wrap gap-5">
            <NuxtLink
                v-for="film in films"
                class="w-[180px]"
                :title="film.name"
                :to="`/catalog/films/${film.id}`">
                <img v-if="film?.cover"
                     :src="coverThumb(film)"
                     alt=""
                     loading="lazy"
                     decoding="async"
                     class="w-full h-[260px] object-cover rounded-lg"/>

                <div class="mt-1.5">
                    <p class="font-medium leading-5 truncate">
                        {{ film.name }}
                    </p>
                    <p class="font-light truncate text-sm">
                        <span>{{ filmFormat(film.format) }}</span>
                        <span v-if="film.produced_year"
                              class="text-neutral-600 dark:text-neutral-400 italic ms-1">
                            {{ film.produced_year }}
                        </span>
                    </p>
                </div>
            </NuxtLink>
        </div>
    </template>
</template>
