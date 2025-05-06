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

                <template v-if="(companyData.films ?? []).length > 0">
                    <h1 class="font-bold text-2xl">Фильмы</h1>

                    <div class="flex flex-wrap gap-5">
                        <NuxtLink
                            v-for="film in companyData.films ?? []"
                            class="w-[180px]"
                            :title="film.name"
                            :to="`/catalog/films/${film.id}`">
                            <div v-if="film?.cover"
                                 class="w-full h-[260px] bg-cover bg-no-repeat bg-center rounded-lg"
                                 :style="`background-image: url(${fileUrl(film?.cover as string)});`"/>

                            <div class="mt-1.5">
                                <p class="font-medium leading-5 truncate">
                                    {{ film.name }}
                                </p>
                                <p class="font-light truncate text-sm">
                                    <span>{{ filmFormat(film.format) }}</span>
                                    <span v-if="film.produced_year"
                                          class="text-gray-600 dark:text-gray-400 italic ms-1">
                                        {{ film.produced_year }}
                                    </span>
                                </p>
                            </div>
                        </NuxtLink>
                    </div>
                </template>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>