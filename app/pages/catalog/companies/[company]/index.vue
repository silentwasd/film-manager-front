<script setup lang="ts">
import type CompanyResource from "~/resources/management/CompanyResource";
import CompanyRepository from "~/repos/management/CompanyRepository";

definePageMeta({
    layout: 'management'
});

const route       = useRoute();
const config      = useRuntimeConfig();
const companyId   = parseInt(route.params.company as string);
const companyRepo = new CompanyRepository();

const {data: company} = await companyRepo.show(`company.${companyId}`, companyId);

const companyData = computed<CompanyResource | null>(() => company.value?.data || null);

useSeoMeta({
    title        : companyData.value?.name + ' // ВКинопоиск',
    description  : companyData.value?.description ?? '',
    ogTitle      : companyData.value?.name,
    ogDescription: companyData.value?.description ?? '',
    ogUrl        : config.public.externalUrl + '/catalog/companies/' + companyData.value?.id,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

// Статусы просмотра — только для вошедшего и только в браузере: публичная
// страница студии рендерится на сервере одинаково для всех.
const token = useToken();

const {data: watchStatuses} = await useAsyncData(
    `company.${companyId}.watch-statuses`,
    async () => token.value
        ? (await companyRepo.watchStatuses(companyId).catch(() => null))?.data ?? {}
        : {},
    {server: false, default: () => ({})}
);
</script>

<template>
    <UMain>
        <UContainer class="py-5">
            <div v-if="companyData" class="flex flex-col font-roboto gap-5">
                <div class="flex flex-col gap-2.5">
                    <h1 class="font-black text-4xl leading-9">{{ companyData.name }}</h1>

                    <p v-for="p in companyData.description?.replaceAll('\r', '')?.split('\n') ?? []"
                       class="text-xl font-light">
                        {{ p }}
                    </p>

                    <div v-if="companyData.link">
                        <NuxtLink :to="companyData.link"
                                  target="_blank"
                                  class="text-xl font-light text-primary hover:text-primary-500">
                            {{ companyData.link }}
                        </NuxtLink>
                    </div>
                </div>

                <BlockTitles :films="companyData.films ?? []" :statuses="watchStatuses"/>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>
