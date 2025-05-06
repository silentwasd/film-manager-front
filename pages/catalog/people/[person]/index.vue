<script setup lang="ts">
import PersonRepository from "~/repos/PersonRepository";
import type PersonResource from "~/resources/PersonResource";

definePageMeta({
    layout: 'management'
});

const route      = useRoute();
const config     = useRuntimeConfig();
const personId   = parseInt(route.params.person as string);
const personRepo = new PersonRepository();

const {data: person} = await personRepo.show(`person.${personId}`, personId);

const personData  = computed<PersonResource | null>(() => person.value?.data || null);
const description = [
    personData.value?.roles?.map((role, index) => index == 0 ? personRole(role) : personRole(role).toLowerCase())?.join(', '),
    'Фильмов: ' + (personData.value?.films_count ?? 0)
].filter(item => item).join('. ');

useSeoMeta({
    title        : personData.value?.name + ' // ВКинопоиск',
    description  : description,
    ogTitle      : personData.value?.name,
    ogDescription: description,
    ogImage      : personData.value?.photo
                   ? fileUrl(personData.value.photo as string)
                   : config.public.externalUrl + '/img/person.jpg',
    ogUrl        : config.public.externalUrl + '/catalog/people/' + personData.value?.id,
    ogType       : 'profile',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const activeRole = ref(personData.value?.roles?.length ? personData.value.roles[0] : undefined);
</script>

<template>
    <UMain>
        <UContainer class="py-5 sm:py-10 relative z-10">
            <div v-if="personData" class="flex flex-col sm:flex-row gap-10">
                <div class="shrink-0">
                    <div class="sm:sticky sm:top-[calc(var(--header-height)+2.5rem)] flex flex-col gap-2.5">
                        <img :src="personData?.photo ? fileUrl(personData.photo) : '/img/person.jpg'"
                             :alt="personData.name"
                             class="block rounded-lg w-full sm:w-[250px] sm:max-h-[400px] border dark:border-gray-800 object-cover"/>
                    </div>
                </div>

                <div class="flex flex-col font-roboto gap-10 grow">
                    <div class="flex flex-col gap-5">
                        <div>
                            <h1 class="font-black text-4xl leading-9">{{ personData.name }}</h1>

                            <h3 v-if="personData.original_name" class="font-medium text-xl text-gray-400 leading-9">
                                {{ personData.original_name }}
                            </h3>
                        </div>

                        <table class="text-lg">
                            <tbody>
                            <tr v-if="personData.birth_date">
                                <td class="w-[150px] font-medium">Дата рождения</td>
                                <td class="font-light">
                                    <NuxtTime :datetime="personData.birth_date" date-style="long"/>
                                </td>
                            </tr>

                            <tr v-if="personData.death_date">
                                <td class="w-[150px] font-medium">Дата смерти</td>
                                <td class="font-light">
                                    <NuxtTime :datetime="personData.death_date" date-style="long"/>
                                </td>
                            </tr>

                            <tr v-if="personData.sex">
                                <td class="w-[150px] font-medium">Пол</td>
                                <td class="font-light">
                                    <p>{{ personSex(personData.sex) }}</p>
                                </td>
                            </tr>

                            <tr v-if="personData.country">
                                <td class="w-[150px] font-medium align-top">Страна</td>
                                <td class="font-light">
                                    <p>{{ personData.country.name }}</p>
                                </td>
                            </tr>

                            <tr v-if="(personData.roles ?? []).length > 0">
                                <td class="w-[150px] font-medium align-top">Деятельность</td>
                                <td class="font-light">
                                    <p>
                                        {{
                                            personData.roles.map((role, index) => index == 0 ? personRole(role) : personRole(role).toLowerCase()).join(', ')
                                        }}
                                    </p>
                                </td>
                            </tr>

                            <tr v-if="(person?.genres ?? []).length > 0">
                                <td class="w-[150px] font-medium align-top">Жанр</td>
                                <td class="font-light">
                                    <UiCommaExpandable :items="person?.genres ?? []" v-slot="{item, index}">
                                        <NuxtLink class="underline underline-offset-2 font-light hover:text-primary-500"
                                                  :to="`/genres/${item.slug}`">
                                            {{ index > 0 ? item.name.toLowerCase() : item.name }}
                                        </NuxtLink>
                                    </UiCommaExpandable>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="(personData.films ?? []).length > 0"
                         class="flex flex-col gap-5">
                        <h1 class="font-bold text-2xl leading-4">
                            <span>Фильмы</span>
                            <span class="ms-1.5 text-gray-400 font-normal">{{ new Set((personData.films ?? []).map(film => film.film_id)).size }}</span>
                        </h1>

                        <div class="flex flex-wrap gap-2.5">
                            <UButton v-for="role in personData.roles"
                                     :color="activeRole == role ? 'primary' : 'gray'"
                                     :label="personRole(role)"
                                     @click="activeRole = role"/>
                        </div>

                        <div class="flex flex-wrap gap-5">
                            <NuxtLink
                                v-for="person in (personData.films ?? []).filter(person => person.role == activeRole).toSorted((a, b) => (b.film?.produced_year ?? 0) - (a.film?.produced_year ?? 0))"
                                class="w-[165px]"
                                :title="person.film?.name"
                                :to="`/catalog/films/${person.film_id}`">
                                <div v-if="person.film?.cover"
                                     class="w-full h-[230px] object-cover bg-cover bg-center bg-no-repeat rounded-lg"
                                     :style="`background-image: url(${fileUrl(person.film?.cover as string)});`"/>

                                <div class="mt-1.5">
                                    <p class="font-medium leading-5 truncate">
                                        {{ person.film?.name }}
                                    </p>
                                    <p class="font-light truncate text-sm">
                                        <span>{{ person.film ? filmFormat(person.film.format) : '' }}</span>
                                        <span v-if="person.film.produced_year"
                                              class="text-gray-600 dark:text-gray-400 italic ms-1">
                                                {{ person.film.produced_year }}
                                            </span>
                                    </p>
                                </div>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>