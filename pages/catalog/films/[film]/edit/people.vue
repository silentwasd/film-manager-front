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

        <div class="flex gap-5">
            <div class="flex flex-col gap-5 grow"
                 :class="{'overflow-auto h-[calc(100dvh-300px)]': activeRole == PersonRole.DubbingActor}">
                <UiFilmPersonRow :film-id="film.id"
                                 :active-role="activeRole"
                                 @refresh="refreshPeople"/>

                <UiFilmPersonRow
                    v-for="person in (people?.data ?? []).filter(_person => activeRole ? _person.role == activeRole : true)"
                    :key="person.id"
                    :film-id="film.id"
                    :person="person"
                    @refresh="refreshPeople"/>

                <UiFilmPersonRow :film-id="film.id"
                                 :active-role="activeRole"
                                 @refresh="refreshPeople"/>
            </div>

            <div v-if="activeRole == PersonRole.DubbingActor"
                 class="w-[300px] shrink-0 overflow-auto h-[calc(100dvh-300px)]">
                <div class="flex flex-col gap-5">
                    <div v-for="person in (people?.data ?? []).filter(_person => _person.role == PersonRole.Actor)"
                         class="flex gap-2.5 items-center leading-5">
                        <div class="w-16 h-16 bg-cover bg-center bg-no-repeat rounded-lg shrink-0 group overflow-clip"
                             :style="`background-image: url(${person.person && person.person.photo ? fileUrl(person.person.photo) : '/img/person.jpg'});`"></div>

                        <p>{{ person.role_details }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>