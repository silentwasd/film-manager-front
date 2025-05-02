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
        <UContainer class="py-5">
            <div v-if="personData" class="flex flex-col sm:flex-row gap-5">
                <div class="shrink-0">
                    <div class="sm:sticky sm:top-20 flex flex-col gap-2.5">
                        <img :src="personData?.photo ? fileUrl(personData.photo) : '/img/person.jpg'"
                             :alt="personData.name"
                             class="block rounded-lg w-full sm:w-[250px] sm:max-h-[400px] border dark:border-gray-800 object-cover"/>
                    </div>
                </div>

                <div class="flex flex-col font-roboto gap-10 grow">
                    <div class="flex flex-col gap-2.5">
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
                                <td>
                                    <NuxtTime :datetime="personData.birth_date"/>
                                </td>
                            </tr>
                            <tr v-if="personData.death_date">
                                <td class="w-[150px] font-medium">Дата смерти</td>
                                <td>
                                    <NuxtTime :datetime="personData.death_date"/>
                                </td>
                            </tr>
                            <tr v-if="personData.sex">
                                <td class="w-[150px] font-medium">Пол</td>
                                <td>
                                    <p>{{ personSex(personData.sex) }}</p>
                                </td>
                            </tr>
                            <tr v-if="personData.country">
                                <td class="w-[150px] font-medium">Страна</td>
                                <td>
                                    <p>{{ personData.country.name }}</p>
                                </td>
                            </tr>
                            <tr v-if="personData.roles">
                                <td class="w-[150px] font-medium">Деятельность</td>
                                <td>
                                    <p>
                                        {{
                                            personData.roles.map((role, index) => index == 0 ? personRole(role) : personRole(role).toLowerCase()).join(', ')
                                        }}
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <template v-if="(personData.films ?? []).length > 0">
                            <h1 class="font-bold text-2xl">Фильмы</h1>

                            <div class="flex gap-2.5">
                                <UButton v-for="role in personData.roles"
                                         :color="activeRole == role ? 'primary' : 'gray'"
                                         :label="personRole(role)"
                                         @click="activeRole = role"/>
                            </div>

                            <div class="flex flex-wrap gap-5">
                                <NuxtLink
                                    v-for="person in (personData.films ?? []).filter(person => person.role == activeRole).toSorted((a, b) => new Date(b.film?.release_date ?? 0).getTime() - new Date(a.film?.release_date ?? 0).getTime())"
                                    class="w-[150px]"
                                    :title="person.film?.name"
                                    :to="`/catalog/films/${person.film_id}`">
                                    <img v-if="person.film?.cover"
                                         :src="fileUrl(person.film?.cover as string)"
                                         :alt="person.film.name"
                                         class="w-full h-[200px] object-cover bg-gradient-to-br from-gray-800 to-gray-950 rounded-lg"/>

                                    <div class="mt-1.5">
                                        <p class="text-lg font-medium leading-5 truncate">
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
                        </template>
                    </div>
                </div>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>