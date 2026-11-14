<script setup lang="ts">
import type Film from "~/resources/Film";
import type FranchiseResource from "~/resources/management/FranchiseResource";
import FranchiseRepository from "~/repos/management/FranchiseRepository";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

/**
 * Блок «Франшиза» на странице фильма: одна лента и, если франшиз несколько,
 * переключатель между ними — две ленты подряд читаются как шум.
 * По умолчанию открыта самая узкая франшиза: у «Нет пути домой» это
 * «Человек-паук» (28), а не вся MCU (68).
 */
const props = defineProps<{
    franchises: FranchiseResource[];
    currentId: number;
}>();

const sortKey = (film: Film) => film.release_date ?? (film.produced_year ? `${film.produced_year}-99` : '9999');

// Новые слева, старые справа — как на таймлайне студии, где свежее сверху.
const newestFirst = (films: Film[]) => [...films].sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || b.id - a.id);

// Франшиза из одного этого фильма ленты не даёт — такие не показываем.
const options = computed(() => props.franchises
    .filter(franchise => (franchise.films ?? []).length > 1)
    .map(franchise => ({...franchise, films: newestFirst(franchise.films ?? [])}))
    .sort((a, b) => a.films.length - b.films.length || a.name.localeCompare(b.name))
);

const selectedId = ref<number | undefined>(options.value[0]?.id);

const selected = computed(() => options.value.find(option => option.id == selectedId.value) ?? options.value[0]);

// Номер по хронологии — с самого старого, хоть лента и идёт от новых: «1 из 16» — первый.
const position = computed(() => {
    const films = selected.value?.films ?? [];
    const index = films.findIndex(film => film.id == props.currentId);

    return index < 0 ? 0 : films.length - index;
});

// Статусы просмотра — только для вошедшего и только в браузере; по франшизе
// грузятся при первом её открытии и дальше берутся из памяти.
const token    = useToken();
const statuses = ref<Record<number, Record<number, FilmWatchStatus>>>({});

async function loadStatuses(id?: number) {
    if (!id || !token.value || statuses.value[id])
        return;

    statuses.value[id] = (await new FranchiseRepository().watchStatuses(id).catch(() => null))?.data ?? {};
}

onMounted(() => loadStatuses(selected.value?.id));
watch(selectedId, id => loadStatuses(id));
</script>

<template>
    <div v-if="selected" class="flex flex-col gap-2.5">
        <div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            <h1 v-if="options.length == 1" class="font-bold text-2xl">
                <span>Франшиза</span>
                <NuxtLink :to="`/catalog/franchises/${selected.id}`"
                          class="ms-1.5 hover:text-primary-500">
                    «{{ selected.name }}»
                </NuxtLink>
            </h1>

            <div v-else class="flex flex-wrap items-center gap-2.5">
                <h1 class="font-bold text-2xl">Франшизы</h1>

                <div class="flex flex-wrap gap-1.5" role="tablist">
                    <UButton v-for="option in options"
                             :key="option.id"
                             role="tab"
                             :aria-selected="option.id == selected.id"
                             :color="option.id == selected.id ? 'primary' : 'neutral'"
                             :variant="option.id == selected.id ? 'solid' : 'soft'"
                             size="sm"
                             @click="() => { selectedId = option.id }">
                        <span>{{ option.name }}</span>
                        <span class="opacity-60 font-normal">{{ option.films.length }}</span>
                    </UButton>
                </div>
            </div>

            <p class="text-sm font-light text-muted">
                <template v-if="position > 0">{{ position }} из {{ selected.films.length }} по хронологии</template>
                <template v-else>{{ selected.films.length }} {{ plural(selected.films.length, 'тайтл', 'тайтла', 'тайтлов') }}</template>
                ·
                <NuxtLink :to="`/catalog/franchises/${selected.id}`" class="text-primary hover:text-primary-500">
                    таймлайн
                </NuxtLink>
            </p>
        </div>

        <!-- :key — новая лента при смене франшизы, чтобы она доехала до текущего тайтла -->
        <UiFranchiseRail :key="selected.id"
                         :films="selected.films"
                         :current-id="currentId"
                         :statuses="statuses[selected.id]"/>
    </div>
</template>
