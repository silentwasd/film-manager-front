<script setup lang="ts">
import FilmRepository from "~/repos/public/FilmRepository";
import HomeRepository from "~/repos/public/HomeRepository";
import {FilmFormat} from "~/types/enums/FilmFormat";
import type {HomeFilm} from "~/resources/public/HomeResource";

definePageMeta({
    layout: 'management'
});

const config = useRuntimeConfig();
const toast  = useToast();

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

const homeRepo     = new HomeRepository();
const {data: home} = await homeRepo.show();

// Поиск и весь каталог — прежняя сетка; пока строка поиска не пуста, подборки скрыты.
const filmRepo      = new FilmRepository();
const name          = ref<string>('');
const slowName      = useThrottle(name, 500);
const searching     = computed(() => slowName.value.trim() !== '');
const page          = ref<number>(1);
const {data: films} = await filmRepo.lazyList(() => ({
    name: slowName.value,
    page: page.value
}));

watch(slowName, () => page.value = 1);

const catalog = ref<HTMLElement>();

watch(page, () => {
    if (!searching.value)
        catalog.value?.scrollIntoView({behavior: 'smooth', block: 'start'});
});

const SERIES_FORMATS = [FilmFormat.Series, FilmFormat.MiniSeries, FilmFormat.CartoonSeries];
const branch         = (film: HomeFilm) => SERIES_FORMATS.includes(film.format) ? 'series' : 'films';

const rolling = ref(false);

async function random() {
    rolling.value = true;

    try {
        const {data} = await homeRepo.random();

        if (data.id)
            await navigateTo(`/catalog/films/${data.id}`);
        else
            toast.add({title: 'Вы посмотрели вообще всё', description: 'Предложить больше нечего.', color: 'info'});
    } finally {
        rolling.value = false;
    }
}

const personal    = computed(() => home.value?.data.personal);
const hasShelves  = computed(() => !!personal.value && (personal.value.must_finish.length + personal.value.to_watch.length) > 0);
</script>

<template>
    <UMain>
        <div class="font-roboto">
            <HomeSpotlight v-if="home?.data.spotlight.length && !searching"
                           :films="home.data.spotlight"
                           :stats="home.data.stats"
                           @random="random"/>

            <UContainer class="py-6 md:py-10 flex flex-col gap-12">
                <div class="flex gap-3">
                    <UInput size="xl"
                            v-model="name"
                            icon="i-lucide-search"
                            placeholder="Найти фильм или сериал..."
                            class="grow"
                            :ui="{trailing: 'pe-1'}">
                        <template v-if="name" #trailing>
                            <UButton color="neutral"
                                     variant="link"
                                     icon="i-lucide-x"
                                     aria-label="Очистить"
                                     @click="name = ''"/>
                        </template>
                    </UInput>

                    <UButton size="xl"
                             color="neutral"
                             variant="subtle"
                             icon="i-lucide-dices"
                             :loading="rolling"
                             title="Случайный фильм"
                             class="shrink-0"
                             @click="random">
                        <span class="hidden sm:inline">Мне повезёт</span>
                    </UButton>
                </div>

                <template v-if="home && !searching">
                    <!-- полки вошедшего -->
                    <div v-if="hasShelves" class="flex flex-col gap-10">
                        <div>
                            <h2 class="font-black text-3xl">С возвращением, {{ personal!.name }}</h2>
                            <p class="text-muted mt-1">
                                Позади {{ personal!.watched }}
                                {{ plural(personal!.watched, 'просмотренный тайтл', 'просмотренных тайтла', 'просмотренных тайтлов') }}.
                                Вот что ждёт дальше.
                            </p>
                        </div>

                        <HomeRail v-if="personal!.must_finish.length"
                                  title="Нужно досмотреть"
                                  icon="i-lucide-play"
                                  to="/catalog/my-films">
                            <div v-for="film in personal!.must_finish" :key="film.id" class="flex shrink-0 snap-start">
                                <UiTimelineCard :film="film as any" :branch="branch(film)" :status="film.status"/>
                            </div>
                        </HomeRail>

                        <HomeRail v-if="personal!.to_watch.length"
                                  title="В планах"
                                  icon="i-lucide-bookmark"
                                  to="/catalog/my-films">
                            <div v-for="film in personal!.to_watch" :key="film.id" class="flex shrink-0 snap-start">
                                <UiTimelineCard :film="film as any" :branch="branch(film)" :status="film.status"/>
                            </div>
                        </HomeRail>
                    </div>

                    <HomeRail v-if="home.data.premieres.length"
                              title="Премьеры"
                              subtitle="Скоро выйдут и вышли за последний год"
                              icon="i-lucide-calendar-days">
                        <div v-for="film in home.data.premieres" :key="film.id" class="flex shrink-0 snap-start">
                            <UiTimelineCard :film="film as any" :branch="branch(film)"/>
                        </div>
                    </HomeRail>

                    <HomeRail v-if="home.data.top.length"
                              title="Любимое зрителями"
                              subtitle="Девятка по реакциям в отзывах"
                              icon="i-lucide-trophy">
                        <HomeTopCard v-for="(film, i) in home.data.top"
                                     :key="film.id"
                                     :film="film"
                                     :rank="i + 1"/>
                    </HomeRail>

                    <section v-if="home.data.reviews.length">
                        <h2 class="flex items-center gap-2 font-bold text-2xl mb-1">
                            <UIcon name="i-lucide-message-square-quote" class="size-6 text-primary"/>
                            Свежие отзывы
                        </h2>
                        <p class="text-sm text-muted mb-3">Что пишут о просмотренном</p>

                        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <HomeReviewCard v-for="review in home.data.reviews"
                                            :key="review.id"
                                            :review="review"/>
                        </div>
                    </section>

                    <HomeRail v-if="home.data.franchises.length"
                              title="Франшизы"
                              subtitle="Вселенные и сквозные линейки — от первого тайтла до последнего"
                              icon="i-lucide-layers">
                        <HomeFranchiseCard v-for="franchise in home.data.franchises"
                                           :key="franchise.id"
                                           :franchise="franchise"/>
                    </HomeRail>

                    <section v-if="home.data.genres.length">
                        <h2 class="flex items-center gap-2 font-bold text-2xl mb-3">
                            <UIcon name="i-lucide-shapes" class="size-6 text-primary"/>
                            Жанры
                        </h2>

                        <div class="flex flex-wrap gap-2">
                            <UButton v-for="genre in home.data.genres"
                                     :key="genre.slug"
                                     :to="`/genres/${genre.slug}`"
                                     :icon="genre.icon ?? 'i-lucide-film'"
                                     color="neutral"
                                     variant="subtle"
                                     size="lg"
                                     class="rounded-full">
                                {{ genre.name }}
                                <span class="text-muted font-normal">{{ genre.count }}</span>
                            </UButton>
                        </div>
                    </section>

                    <HomeRail v-if="home.data.recent.length"
                              title="Недавно в каталоге"
                              subtitle="Последние заведённые карточки"
                              icon="i-lucide-sparkles">
                        <div v-for="film in home.data.recent" :key="film.id" class="flex shrink-0 snap-start">
                            <UiTimelineCard :film="film as any" :branch="branch(film)"/>
                        </div>
                    </HomeRail>
                </template>

                <!-- весь каталог / результаты поиска -->
                <section ref="catalog" class="scroll-mt-[calc(var(--ui-header-height)+1rem)]">
                    <h2 class="flex items-center gap-2 font-bold text-2xl mb-5">
                        <UIcon :name="searching ? 'i-lucide-search' : 'i-lucide-library'" class="size-6 text-primary"/>
                        {{ searching ? 'Результаты поиска' : 'Весь каталог' }}
                        <span v-if="films?.meta.total" class="text-muted font-normal">{{ films.meta.total }}</span>
                    </h2>

                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        <NuxtLink class="group block"
                                  :to="`/catalog/films/${film.id}`"
                                  v-for="film in films?.data ?? []"
                                  :key="film.id">
                            <div class="aspect-[2/3] rounded-lg overflow-hidden bg-elevated ring-1 ring-default transition group-hover:ring-2 group-hover:ring-primary">
                                <img v-if="film.cover"
                                     :src="coverThumb(film)"
                                     :alt="film.name"
                                     loading="lazy"
                                     class="size-full object-cover transition duration-300 group-hover:scale-105"/>
                            </div>

                            <div class="mt-1.5">
                                <p class="truncate font-medium leading-5">{{ film.name }}</p>
                                <p class="font-light truncate text-sm text-muted">
                                    {{ filmFormat(film.format) }} · {{ film.produced_year }}
                                </p>
                            </div>
                        </NuxtLink>
                    </div>

                    <p v-if="films && !films.data.length" class="text-muted py-10 text-center">
                        Ничего не нашлось.
                    </p>

                    <div v-if="(films?.meta.total ?? 0) > (films?.meta.per_page ?? 0)" class="flex justify-center">
                        <UPagination v-model:page="page"
                                     class="mt-10"
                                     size="xl"
                                     :items-per-page="films?.meta.per_page"
                                     :total="films?.meta.total"/>
                    </div>
                </section>
            </UContainer>
        </div>
    </UMain>
</template>
