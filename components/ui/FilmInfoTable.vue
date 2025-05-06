<script setup lang="ts">
import type Film from "~/resources/Film";
import {PersonRole} from "~/types/enums/PersonRole";

const props = defineProps<{
    film: Film
}>();

const directors     = computed(() => (props.film.people ?? []).filter(person => person.role == PersonRole.Director));
const producers     = computed(() => (props.film.people ?? []).filter(person => person.role == PersonRole.Producer));
const screenwriters = computed(() => (props.film.people ?? []).filter(person => person.role == PersonRole.Screenwriter));
const composers     = computed(() => (props.film.people ?? []).filter(person => person.role == PersonRole.Composer));
</script>

<template>
    <table class="text-lg">
        <tbody>
        <tr>
            <td class="w-[200px] font-medium">Формат</td>
            <td class="font-light">{{ filmFormat(film.format) }}</td>
        </tr>

        <tr v-if="film.produced_year">
            <td class="font-medium">Год производства</td>
            <td class="font-light">
                {{ film.produced_year }}
            </td>
        </tr>

        <tr v-if="(film.genres ?? []).length > 0">
            <td class="font-medium align-top">Жанр</td>
            <td>
                <UiCommaExpandable :items="film.genres ?? []" v-slot="{item, index}">
                    <NuxtLink class="underline underline-offset-2 font-light hover:text-primary-500"
                              :to="`/genres/${item.slug}`">
                        {{ index > 0 ? item.name.toLowerCase() : item.name }}
                    </NuxtLink>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="(film.countries ?? []).length > 0">
            <td class="font-medium align-top">Страна</td>
            <td class="font-light">
                <UiCommaExpandable :items="film.countries ?? []" v-slot="{item}">
                    <span>{{ item.name }}</span>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="(film.tags ?? []).length > 0">
            <td class="font-medium align-top">Теги</td>
            <td class="font-light">
                <UiCommaExpandable :items="film.tags ?? []" v-slot="{item}">
                    <span>{{ item.name }}</span>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="directors.length > 0">
            <td class="font-medium align-top">Режиссёр</td>
            <td class="font-light">
                <UiCommaExpandable :items="directors ?? []" v-slot="{item}">
                    <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                              :to="`/catalog/people/${item.person.id}`">
                        {{ item.person.name }}
                    </NuxtLink>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="producers.length > 0">
            <td class="font-medium align-top">Продюсер</td>
            <td class="font-light">
                <UiCommaExpandable :items="producers ?? []" v-slot="{item}">
                    <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                              :to="`/catalog/people/${item.person.id}`">
                        {{ item.person.name }}
                    </NuxtLink>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="screenwriters.length > 0">
            <td class="font-medium align-top">Сценарист</td>
            <td class="font-light">
                <UiCommaExpandable :items="screenwriters ?? []" v-slot="{item}">
                    <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                              :to="`/catalog/people/${item.person.id}`">
                        {{ item.person.name }}
                    </NuxtLink>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="composers.length > 0">
            <td class="font-medium align-top">Композитор</td>
            <td class="font-light">
                <UiCommaExpandable :items="composers ?? []" v-slot="{item}">
                    <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                              :to="`/catalog/people/${item.person.id}`">
                        {{ item.person.name }}
                    </NuxtLink>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="(film.companies ?? []).length > 0">
            <td class="font-medium align-top">Компания</td>
            <td class="font-light">
                <UiCommaExpandable :items="film.companies ?? []">
                    <template #default="{item}">
                        <NuxtLink class="underline underline-offset-2 hover:text-primary-500"
                                  :to="`/catalog/companies/${item.id}`">
                            {{ item.name }}
                        </NuxtLink>
                    </template>
                </UiCommaExpandable>
            </td>
        </tr>

        <tr v-if="film.release_date">
            <td class="font-medium">Дата премьеры</td>
            <td class="font-light">
                <NuxtTime :datetime="film.release_date" date-style="long"/>
            </td>
        </tr>
        </tbody>
    </table>
</template>

<style scoped>

</style>