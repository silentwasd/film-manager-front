<script setup lang="ts">
import type Film from "~/resources/Film";
import {FilmFormat} from "~/types/enums/FilmFormat";
import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

/**
 * Таймлайн тайтлов с двумя ветками: фильмы слева, сериалы (+ мини-сериалы)
 * справа, общая ось по годам посередине. Анимация живёт в отдельном таймлайне
 * с теми же ветками (мультфильмы / мультсериалы) — переключатель появляется,
 * когда есть и то и другое.
 * Если ветка одна, рисуется одной колонкой; на телефоне — всегда одной колонкой.
 */
const props = defineProps<{
    films: Film[];
    // film_id => статус просмотра текущего пользователя; пусто — гость
    statuses?: Record<number, FilmWatchStatus>;
}>();

type Branch = 'films' | 'series';

interface YearRow {
    kind: 'year';
    year: number | null;
    films: Film[];
    series: Film[];
}

interface GapRow {
    kind: 'gap';
    years: number;
}

const SERIES_FORMATS    = [FilmFormat.Series, FilmFormat.MiniSeries, FilmFormat.CartoonSeries];
const ANIMATED_FORMATS  = [FilmFormat.Cartoon, FilmFormat.CartoonSeries];

type Section = 'live' | 'animated';

const sectionOf = (film: Film): Section => ANIMATED_FORMATS.includes(film.format) ? 'animated' : 'live';

const sectionCounts = computed(() => ({
    live    : props.films.filter(film => sectionOf(film) === 'live').length,
    animated: props.films.filter(film => sectionOf(film) === 'animated').length
}));

const bothSections = computed(() => sectionCounts.value.live > 0 && sectionCounts.value.animated > 0);

const section = ref<Section>(sectionCounts.value.live > 0 ? 'live' : 'animated');

const visible = computed(() => bothSections.value
    ? props.films.filter(film => sectionOf(film) === section.value)
    : props.films);

const labels = computed(() => section.value === 'animated' && bothSections.value || sectionCounts.value.live === 0
    ? {films: 'Мультфильмы', series: 'Мультсериалы'}
    : {films: 'Фильмы', series: 'Сериалы'});

const sectionOptions = computed(() => [
    {value: 'live' as Section, label: 'Кино', count: sectionCounts.value.live, icon: 'i-lucide-clapperboard'},
    {value: 'animated' as Section, label: 'Анимация', count: sectionCounts.value.animated, icon: 'i-lucide-palette'}
]);

const branchOf = (film: Film): Branch => SERIES_FORMATS.includes(film.format) ? 'series' : 'films';

const yearOf = (film: Film): number | null =>
    film.produced_year ?? (film.release_date ? parseInt(film.release_date.slice(0, 4)) : null);

// Внутри года — по дате выхода, без даты — в конец года, затем по имени.
const sortKey = (film: Film) => film.release_date ?? `${yearOf(film) ?? 9999}-99-99`;

const counts = computed(() => ({
    films : visible.value.filter(film => branchOf(film) === 'films').length,
    series: visible.value.filter(film => branchOf(film) === 'series').length
}));

const twoBranches = computed(() => counts.value.films > 0 && counts.value.series > 0);

const rows = computed<(YearRow | GapRow)[]>(() => {
    const byYear = new Map<number | null, YearRow>();

    // Свежее сверху: и годы, и тайтлы внутри года — от новых к старым.
    const sorted = visible.value.toSorted((a, b) =>
        sortKey(b).localeCompare(sortKey(a)) || a.name.localeCompare(b.name, 'ru'));

    for (const film of sorted) {
        const year = yearOf(film);

        if (!byYear.has(year))
            byYear.set(year, {kind: 'year', year, films: [], series: []});

        byYear.get(year)![branchOf(film)].push(film);
    }

    const years = [...byYear.keys()]
        .filter((year): year is number => year !== null)
        .sort((a, b) => b - a);

    const result: (YearRow | GapRow)[] = [];

    years.forEach((year, index) => {
        const newer = years[index - 1];

        if (newer !== undefined && newer - year > 2)
            result.push({kind: 'gap', years: newer - year - 1});

        result.push(byYear.get(year)!);
    });

    if (byYear.has(null))
        result.push(byYear.get(null)!);

    return result;
});

const hasStatuses = computed(() => Object.keys(props.statuses ?? {}).length > 0);

const statusOf = (film: Film) => props.statuses?.[film.id];

// Прогресс по текущему разделу (кино или анимация).
const progress = computed(() => {
    const total   = visible.value.length;
    const watched = visible.value.filter(film => statusOf(film) === FilmWatchStatus.Watched).length;

    return {total, watched, percent: total ? Math.round(watched / total * 100) : 0};
});

const gapLabel = (years: number) => `${years} ${plural(years, 'год', 'года', 'лет')} без релизов`;
</script>

<template>
    <div class="font-roboto">
        <div v-if="hasStatuses" class="mx-auto mb-5 w-full max-w-md">
            <div class="flex items-baseline justify-between text-sm mb-1.5">
                <span class="font-medium">Просмотрено</span>
                <span class="text-muted tabular-nums">
                    {{ progress.watched }} из {{ progress.total }} · {{ progress.percent }}%
                </span>
            </div>
            <div class="h-2 rounded-full bg-elevated overflow-hidden">
                <div class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                     :style="{width: `${progress.percent}%`}"/>
            </div>
        </div>

        <div v-if="bothSections" class="flex justify-center gap-2 pb-5">
            <UButton v-for="option in sectionOptions"
                     :key="option.value"
                     size="sm"
                     :color="section === option.value ? 'primary' : 'neutral'"
                     :variant="section === option.value ? 'solid' : 'soft'"
                     :icon="option.icon"
                     @click="section = option.value">
                {{ option.label }}
                <span class="opacity-70 tabular-nums">{{ option.count }}</span>
            </UButton>
        </div>

        <!-- Две ветки: десктоп -->
        <div v-if="twoBranches" class="hidden md:block relative">
            <div class="absolute left-1/2 top-12 bottom-0 w-0.5 -translate-x-1/2 rounded-full
                        bg-gradient-to-b from-primary/60 via-neutral-300 to-amber-500/60
                        dark:via-neutral-700"/>

            <div class="grid grid-cols-[1fr_6rem_1fr]">
                <div class="flex items-center justify-end gap-2 pb-4">
                    <span class="text-lg font-bold">{{ labels.films }}</span>
                    <span class="text-muted">{{ counts.films }}</span>
                    <span class="size-2.5 rounded-full bg-primary"/>
                </div>
                <div/>
                <div class="flex items-center gap-2 pb-4">
                    <span class="size-2.5 rounded-full bg-amber-500"/>
                    <span class="text-lg font-bold">{{ labels.series }}</span>
                    <span class="text-muted">{{ counts.series }}</span>
                </div>

                <template v-for="(row, index) in rows" :key="`d${index}`">
                    <template v-if="row.kind === 'year'">
                        <div class="flex flex-wrap justify-end content-start gap-4 py-4 pe-2 border-t border-default/60">
                            <UiTimelineCard v-for="film in row.films" :key="film.id" :film="film" branch="films" :status="statusOf(film)"/>
                        </div>

                        <div class="flex justify-center py-4 border-t border-default/60">
                            <span class="relative z-10 h-fit rounded-full px-3 py-1 text-sm font-bold tabular-nums
                                         bg-default ring-1 ring-default shadow-sm">
                                {{ row.year ?? 'Без года' }}
                            </span>
                        </div>

                        <div class="flex flex-wrap content-start gap-4 py-4 ps-2 border-t border-default/60">
                            <UiTimelineCard v-for="film in row.series" :key="film.id" :film="film" branch="series" :status="statusOf(film)"/>
                        </div>
                    </template>

                    <div v-else class="col-span-3 flex justify-center py-1">
                        <span class="relative z-10 px-2 text-xs italic text-dimmed bg-default">
                            {{ gapLabel(row.years) }}
                        </span>
                    </div>
                </template>
            </div>
        </div>

        <!-- Одна колонка: телефон или одна ветка -->
        <div :class="twoBranches ? 'md:hidden' : ''">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 pb-4">
                <span v-if="counts.films" class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-primary"/>
                    <span class="font-bold">{{ labels.films }}</span>
                    <span class="text-muted">{{ counts.films }}</span>
                </span>
                <span v-if="counts.series" class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-amber-500"/>
                    <span class="font-bold">{{ labels.series }}</span>
                    <span class="text-muted">{{ counts.series }}</span>
                </span>
            </div>

            <div class="relative ps-8">
                <div class="absolute left-3 top-0 bottom-0 w-0.5 rounded-full bg-neutral-300 dark:bg-neutral-700"/>

                <template v-for="(row, index) in rows" :key="`m${index}`">
                    <div v-if="row.kind === 'year'" class="relative pb-6">
                        <span class="absolute -left-[1.6rem] top-1 size-3 rounded-full ring-4 ring-(--ui-bg)"
                              :class="row.films.length && row.series.length
                                      ? 'bg-gradient-to-r from-primary to-amber-500'
                                      : row.films.length ? 'bg-primary' : 'bg-amber-500'"/>

                        <p class="text-lg font-bold leading-5 tabular-nums mb-2.5">{{ row.year ?? 'Без года' }}</p>

                        <div class="flex flex-wrap gap-3">
                            <UiTimelineCard v-for="film in row.films" :key="film.id" :film="film" branch="films" :status="statusOf(film)"/>
                            <UiTimelineCard v-for="film in row.series" :key="film.id" :film="film" branch="series" :status="statusOf(film)"/>
                        </div>
                    </div>

                    <p v-else class="relative -mt-2 pb-4 text-xs italic text-dimmed">
                        {{ gapLabel(row.years) }}
                    </p>
                </template>
            </div>
        </div>
    </div>
</template>
