<script setup lang="ts">
import type {HomeTopFilm} from "~/resources/public/HomeResource";

/** Карточка «Любимое зрителями»: огромная контурная цифра места за постером. */
defineProps<{
    film: HomeTopFilm;
    rank: number;
}>();
</script>

<template>
    <NuxtLink :to="`/catalog/films/${film.id}`"
              :title="film.name"
              class="group shrink-0 snap-start">
        <!-- цифра привязана к постеру, а не ко всей карточке: иначе у двухстрочных
             названий она уезжает ниже. Обводка рисуется под заливкой цвета фона
             (paint-order) — у Roboto Black цифры из пересекающихся контуров, и голый
             text-stroke обводит их стыки внутри глифа -->
        <!-- цифра Roboto Black — ~0.58em (87px при 150px); постер заходит на неё
             примерно на четверть. Место только под одну цифру: топ — девятка -->
        <div class="relative pl-[43px] sm:pl-[60px]">
            <span class="absolute left-0 bottom-1 font-black leading-[0.75] select-none text-[110px] sm:text-[150px]
                         text-(--ui-bg) [paint-order:stroke_fill] [-webkit-text-stroke:6px_var(--ui-border-accented)]
                         transition group-hover:[-webkit-text-stroke-color:var(--ui-primary)]">
                {{ rank }}
            </span>

            <div class="relative w-[120px] sm:w-[140px] aspect-[2/3] rounded-lg overflow-hidden bg-elevated ring-1 ring-default shadow-lg
                        transition group-hover:ring-2 group-hover:ring-primary">
                <img v-if="film.cover"
                     :src="coverThumb(film)"
                     alt=""
                     loading="lazy"
                     decoding="async"
                     draggable="false"
                     class="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105"/>
            </div>
        </div>

        <div class="ml-[43px] sm:ml-[60px] w-[120px] sm:w-[140px]">
            <p class="mt-1.5 font-medium text-sm leading-4 line-clamp-2">{{ film.name }}</p>
            <p class="mt-0.5 flex items-center gap-2.5 text-xs text-muted">
                <span class="flex items-center gap-0.5" :title="`Понравилось: ${film.likes}`">
                    <UIcon name="i-lucide-thumbs-up" class="size-3"/> {{ film.likes }}
                </span>
                <span class="flex items-center gap-0.5" :title="`Посмотрели: ${film.watched}`">
                    <UIcon name="i-lucide-eye" class="size-3"/> {{ film.watched }}
                </span>
            </p>
        </div>
    </NuxtLink>
</template>
