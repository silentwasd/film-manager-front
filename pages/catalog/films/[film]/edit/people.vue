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
    <div>
        <div class="flex flex-col gap-5 py-5">
            <UiFilmPersonRow :film-id="film.id"
                             @refresh="refreshPeople"/>

            <UiFilmPersonRow v-for="person in people.data ?? []"
                             :film-id="film.id"
                             :person="person"
                             @refresh="refreshPeople"/>

            <UiFilmPersonRow :film-id="film.id"
                             @refresh="refreshPeople"/>
        </div>
    </div>
</template>

<style scoped>

</style>