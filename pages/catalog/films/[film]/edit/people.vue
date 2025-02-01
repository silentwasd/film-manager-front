<script setup lang="ts">
import type Film from "~/resources/Film";
import FilmPersonRepository from "~/repos/FilmPersonRepository";

const props = defineProps<{
    film: Film,
    refresh: () => Promise<void>
}>();

const saving = defineModel<boolean>('saving');
const save   = defineModel<() => Promise<void>>('save');

save.value = undefined;

const personRepo                                     = new FilmPersonRepository(props.film.id);
const {data: people, refresh: refreshPeople, status} = await personRepo.list(`film.${props.film.id}.people`);
</script>

<template>
    <table class="my-2.5">
        <tbody>
        <UiFilmPersonAdd v-if="(people?.data ?? []).length > 5"
                         :film-id="film.id"
                         @added="refreshPeople"/>

        <UiFilmPersonRow v-for="person in (people?.data ?? [])"
                         :key="person.id"
                         :person="person"
                         :film-id="film.id"
                         @removed="refreshPeople"/>

        <UiFilmPersonAdd :film-id="film.id"
                         @added="refreshPeople"/>
        </tbody>
    </table>
</template>

<style scoped>

</style>