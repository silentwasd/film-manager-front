<script setup lang="ts">
import type Film from "~/resources/Film";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

const props = defineProps<{
    film: Film;
    branch: 'films' | 'series';
    status?: FilmWatchStatus;
}>();

const statusMeta = computed(() => props.status ? watchStatusMeta(props.status) : null);

const today = new Date().toISOString().slice(0, 10);

const isUpcoming = computed(() => !!props.film.release_date && props.film.release_date > today);
</script>

<template>
    <NuxtLink class="group w-[120px] sm:w-[130px] shrink-0"
              :title="film.original_name ? `${film.name} (${film.original_name})` : film.name"
              :to="`/catalog/films/${film.id}`">
        <div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-elevated ring-1 ring-default
                    transition group-hover:ring-2"
             :class="branch === 'films' ? 'group-hover:ring-primary' : 'group-hover:ring-amber-500'">
            <!-- <img loading="lazy">, а не CSS-фон: фоны браузер качает все сразу,
                 и таймлайн студии на 140 тайтлов тянул бы все постеры разом -->
            <img v-if="film.cover"
                 :src="coverThumb(film)"
                 alt=""
                 loading="lazy"
                 decoding="async"
                 draggable="false"
                 class="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105"/>
            <div v-else class="absolute inset-0 flex items-center justify-center text-dimmed">
                <UIcon name="i-lucide-film" class="size-8"/>
            </div>

            <span v-if="statusMeta"
                  :title="statusMeta.label"
                  class="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full shadow ring-2 ring-black/20"
                  :class="statusMeta.classes">
                <UIcon :name="statusMeta.icon" class="size-3.5"/>
            </span>

            <span v-if="isUpcoming"
                  class="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium bg-black/70 text-white">
                скоро
            </span>
        </div>

        <div class="mt-1.5">
            <p class="font-medium text-sm leading-4 line-clamp-2">{{ film.name }}</p>
            <p class="mt-0.5 flex items-center gap-1 text-xs font-light text-muted truncate">
                <span class="inline-block size-1.5 rounded-full shrink-0"
                      :class="branch === 'films' ? 'bg-primary' : 'bg-amber-500'"/>
                <span class="truncate">
                    {{ film.release_date ? dater(film.release_date) : filmFormat(film.format) }}
                </span>
            </p>
        </div>
    </NuxtLink>
</template>
