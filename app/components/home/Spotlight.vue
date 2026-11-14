<script setup lang="ts">
import type {HomeSpotlight} from "~/resources/public/HomeResource";

/**
 * Витрина: фон на всю ширину, постер, описание и жанры. Листается сама
 * раз в 8 секунд, на наведении замирает. Фоны тяжёлые (до 1 МБ), поэтому
 * <img> появляется только у слайдов, до которых уже дошли.
 */
const props = defineProps<{
    films: HomeSpotlight[];
    stats: { films: number, series: number, people: number, reviews: number };
}>();

const emit = defineEmits<{ random: [] }>();

const index   = ref(0);
const visited = ref(new Set<number>([0]));
const paused  = ref(false);

const current = computed(() => props.films[index.value]);

function go(i: number) {
    index.value = (i + props.films.length) % props.films.length;
    visited.value.add(index.value);
}

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    if (props.films.length < 2)
        return;

    // Следующий фон подгружаем заранее, чтобы смена не мигала пустотой.
    visited.value.add(1);

    timer = setInterval(() => {
        if (!paused.value && document.visibilityState === 'visible') {
            go(index.value + 1);
            visited.value.add((index.value + 1) % props.films.length);
        }
    }, 8000);
});

onBeforeUnmount(() => timer && clearInterval(timer));

const number = (n: number) => n.toLocaleString('ru-RU');

const statLine = computed(() => [
    `${number(props.stats.films)} ${plural(props.stats.films, 'фильм', 'фильма', 'фильмов')}`,
    `${number(props.stats.series)} ${plural(props.stats.series, 'сериал', 'сериала', 'сериалов')}`,
    `${number(props.stats.people)} ${plural(props.stats.people, 'человек', 'человека', 'человек')}`,
    `${number(props.stats.reviews)} ${plural(props.stats.reviews, 'отзыв', 'отзыва', 'отзывов')}`
]);
</script>

<template>
    <section class="relative isolate overflow-hidden bg-neutral-950 text-white"
             @mouseenter="paused = true"
             @mouseleave="paused = false">
        <!-- фоны -->
        <div class="absolute inset-0 -z-10">
            <template v-for="(film, i) in films" :key="film.id">
                <img v-if="visited.has(i)"
                     :src="fileUrl(film.background_cover)"
                     alt=""
                     class="absolute inset-0 size-full object-cover object-top transition-opacity duration-1000"
                     :class="i === index ? 'opacity-100' : 'opacity-0'"/>
            </template>

            <div class="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/10"/>
            <div class="absolute inset-0 bg-linear-to-t from-neutral-950 via-transparent to-neutral-950/40"/>
        </div>

        <UContainer class="relative pt-10 pb-8 md:pt-16 md:pb-10 min-h-[440px] md:min-h-[520px] flex flex-col">
            <Transition mode="out-in"
                        enter-active-class="transition duration-500"
                        enter-from-class="opacity-0 translate-y-3"
                        leave-active-class="transition duration-300"
                        leave-to-class="opacity-0 -translate-y-2">
                <div v-if="current" :key="current.id" class="flex gap-6 md:gap-10 items-end grow">
                    <NuxtLink :to="`/catalog/films/${current.id}`"
                              class="hidden sm:block shrink-0 w-[160px] md:w-[210px] aspect-[2/3] rounded-xl overflow-hidden
                                     ring-1 ring-white/15 shadow-2xl shadow-black/60 transition hover:ring-white/40 hover:-translate-y-1">
                        <img :src="coverThumb(current)" :alt="current.name" class="size-full object-cover"/>
                    </NuxtLink>

                    <div class="min-w-0 max-w-2xl">
                        <p class="text-xs uppercase tracking-[0.2em] text-white/60 font-medium mb-3">
                            Сегодня на витрине
                        </p>

                        <NuxtLink :to="`/catalog/films/${current.id}`">
                            <h2 class="font-black text-4xl md:text-6xl leading-none tracking-tight hover:text-white/85 transition">
                                {{ current.name }}
                            </h2>
                        </NuxtLink>

                        <p v-if="current.original_name" class="mt-2 text-lg text-white/60 font-medium">
                            {{ current.original_name }}
                        </p>

                        <div class="mt-4 flex flex-wrap items-center gap-2 text-sm">
                            <span class="font-semibold">{{ current.produced_year }}</span>
                            <span class="text-white/40">•</span>
                            <span>{{ filmFormat(current.format) }}</span>

                            <template v-for="genre in current.genres" :key="genre.slug">
                                <NuxtLink :to="`/genres/${genre.slug}`"
                                          class="rounded-full bg-white/10 px-2.5 py-0.5 backdrop-blur hover:bg-white/20 transition">
                                    {{ genre.name }}
                                </NuxtLink>
                            </template>
                        </div>

                        <p class="mt-4 text-base md:text-lg font-light text-white/80 line-clamp-3">
                            {{ current.description }}
                        </p>

                        <div class="mt-6 flex flex-wrap gap-3">
                            <UButton :to="`/catalog/films/${current.id}`"
                                     label="Подробнее"
                                     icon="i-lucide-info"
                                     size="lg"
                                     color="neutral"
                                     variant="solid"
                                     class="bg-white text-neutral-900 hover:bg-white/85"/>

                            <UButton label="Что посмотреть?"
                                     icon="i-lucide-dices"
                                     size="lg"
                                     color="neutral"
                                     variant="outline"
                                     class="bg-transparent text-white ring-white/30 hover:bg-white/10 active:bg-white/15"
                                     @click="emit('random')"/>
                        </div>
                    </div>
                </div>
            </Transition>

            <div class="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p class="text-sm text-white/50">
                    <template v-for="(item, i) in statLine" :key="i">
                        <span v-if="i" class="mx-1.5">·</span>{{ item }}
                    </template>
                </p>

                <div v-if="films.length > 1" class="flex items-center gap-2">
                    <button v-for="(film, i) in films"
                            :key="film.id"
                            type="button"
                            :aria-label="film.name"
                            class="h-1.5 rounded-full transition-all duration-300"
                            :class="i === index ? 'w-8 bg-white' : 'w-3 bg-white/30 hover:bg-white/60'"
                            @click="go(i)"/>
                </div>
            </div>
        </UContainer>
    </section>
</template>
