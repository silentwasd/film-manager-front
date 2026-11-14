<script setup lang="ts">
import type FranchiseResource from "~/resources/management/FranchiseResource";
import FranchiseRepository from "~/repos/management/FranchiseRepository";
import type CompanyResource from "~/resources/management/CompanyResource";

definePageMeta({
    layout: 'management'
});

const route       = useRoute();
const config      = useRuntimeConfig();
const franchiseId   = parseInt(route.params.franchise as string);
const franchiseRepo = new FranchiseRepository();

const {data: franchise} = await franchiseRepo.show(`franchise.${franchiseId}`, franchiseId);

const franchiseData = computed<FranchiseResource | null>(() => franchise.value?.data || null);

useSeoMeta({
    title        : franchiseData.value?.name + ' // ВКинопоиск',
    description  : franchiseData.value?.description ?? '',
    ogTitle      : franchiseData.value?.name,
    ogDescription: franchiseData.value?.description ?? '',
    ogUrl        : config.public.externalUrl + '/catalog/franchises/' + franchiseData.value?.id,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

/**
 * Студии, делавшие тайтлы франшизы, — в порядке появления, с годами работы:
 * так видно, как права переходили из рук в руки.
 */
const studios = computed(() => {
    const map = new Map<number, { id: number, name: string, count: number, from: number | null, to: number | null }>();

    for (const film of franchiseData.value?.films ?? []) {
        for (const company of (film.companies ?? []) as CompanyResource[]) {
            const studio = map.get(company.id) ?? {id: company.id, name: company.name, count: 0, from: null, to: null};
            const year   = film.produced_year ?? null;

            studio.count++;

            if (year) {
                studio.from = studio.from === null ? year : Math.min(studio.from, year);
                studio.to   = studio.to === null ? year : Math.max(studio.to, year);
            }

            map.set(company.id, studio);
        }
    }

    return [...map.values()].sort((a, b) =>
        (a.from ?? 9999) - (b.from ?? 9999) || b.count - a.count || a.name.localeCompare(b.name)
    );
});

const years = (studio: { from: number | null, to: number | null }) =>
    !studio.from ? '' : studio.from == studio.to ? `${studio.from}` : `${studio.from}–${studio.to}`;

// Статусы просмотра — только для вошедшего и только в браузере: публичная
// страница франшизы рендерится на сервере одинаково для всех.
const token = useToken();

const {data: watchStatuses} = await useAsyncData(
    `franchise.${franchiseId}.watch-statuses`,
    async () => token.value
        ? (await franchiseRepo.watchStatuses(franchiseId).catch(() => null))?.data ?? {}
        : {},
    {server: false, default: () => ({})}
);
</script>

<template>
    <UMain>
        <UContainer class="py-5">
            <div v-if="franchiseData" class="flex flex-col font-roboto gap-5">
                <div class="flex flex-col gap-2.5">
                    <h1 class="font-black text-4xl leading-9">{{ franchiseData.name }}</h1>

                    <p v-for="p in franchiseData.description?.replaceAll('\r', '')?.split('\n') ?? []"
                       class="text-xl font-light">
                        {{ p }}
                    </p>

                    <div v-if="franchiseData.link">
                        <NuxtLink :to="franchiseData.link"
                                  target="_blank"
                                  class="text-xl font-light text-primary hover:text-primary-500">
                            {{ franchiseData.link }}
                        </NuxtLink>
                    </div>
                </div>

                <div v-if="studios.length > 0" class="flex flex-col gap-2.5">
                    <h2 class="font-bold text-2xl">
                        <span>Студии</span>
                        <span class="ms-1.5 text-neutral-400 font-normal">{{ studios.length }}</span>
                    </h2>

                    <div class="flex flex-wrap gap-2">
                        <UButton v-for="studio in studios"
                                 :key="studio.id"
                                 :to="`/catalog/companies/${studio.id}`"
                                 color="neutral"
                                 variant="soft"
                                 size="sm">
                            <span>{{ studio.name }}</span>
                            <span class="text-neutral-500 dark:text-neutral-400 font-normal">
                                {{ years(studio) }} · {{ studio.count }}
                            </span>
                        </UButton>
                    </div>
                </div>

                <BlockTitles :films="franchiseData.films ?? []" :statuses="watchStatuses"/>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>
