<script setup lang="ts">
import type Film from "~/resources/Film";
import FilmPersonRepository from "~/repos/FilmPersonRepository";
import {PersonRole} from "~/types/enums/PersonRole";

const props = defineProps<{
    film: Film,
    refresh: () => Promise<void>
}>();

const saving = defineModel<boolean>('saving');
const save   = defineModel<() => Promise<void>>('save');

save.value = undefined;

const personRepo                                     = new FilmPersonRepository(props.film.id);
const {data: people, refresh: refreshPeople, status} = await personRepo.list(`film.${props.film.id}.people`);

const roles      = Object.values(PersonRole);
const activeRole = ref<PersonRole | null>(null);
</script>

<template>
    <div class="flex flex-col gap-5 py-5">
        <div class="flex flex-wrap gap-2.5">
            <UButton label="Все"
                     :color="activeRole ? 'gray' : 'primary'"
                     @click="activeRole = null"/>

            <UButton v-for="role in roles"
                     :label="personRole(role)"
                     :color="activeRole == role ? 'primary' : 'gray'"
                     @click="activeRole = role"/>
        </div>

        <div class="flex flex-col gap-5">
            <UiFilmPersonRow :film-id="film.id"
                             :active-role="activeRole"
                             @refresh="refreshPeople"/>

            <UiFilmPersonRow v-for="person in (people?.data ?? []).filter(_person => activeRole ? _person.role == activeRole : true)"
                             :key="person.id"
                             :film-id="film.id"
                             :person="person"
                             @refresh="refreshPeople"/>

            <UiFilmPersonRow :film-id="film.id"
                             :active-role="activeRole"
                             @refresh="refreshPeople"/>
        </div>
    </div>
</template>

<style scoped>

</style>