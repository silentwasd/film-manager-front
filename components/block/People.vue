<script setup lang="ts">
import type FilmPersonResource from "~/resources/FilmPersonResource";
import {PersonRole} from "~/types/enums/PersonRole";

defineProps<{
    people: FilmPersonResource[]
}>();

const details = ref<boolean>(false);

const roles = [
    PersonRole.Director,
    PersonRole.Actor,
    PersonRole.VoiceActor,
    PersonRole.Producer,
    PersonRole.DubbingDirector,
    PersonRole.Translator,
    PersonRole.DubbingActor,
    PersonRole.Screenwriter,
    PersonRole.Operator,
    PersonRole.Composer,
    PersonRole.SoundDirector,
    PersonRole.Artist,
    PersonRole.Editor
];

const activeRole = ref<PersonRole | null>(null);
</script>

<template>
    <div>
        <div v-if="!details" class="flex flex-wrap gap-5 mt-5">
            <NuxtLink v-for="person in people.slice(0, 6)"
                      class="flex items-center gap-2.5 w-[250px]"
                      :key="person.id"
                      :to="`/catalog/people/${person.person_id}`">
                <div
                    :style="`background-image: url(${person.person?.photo ? fileUrl(person.person?.photo) : '/img/person.jpg'})`"
                    class="block rounded-md w-[80px] h-[80px] shrink-0 bg-cover bg-center"/>

                <div class="font-roboto grow w-0">
                    <p class="font-light leading-3 text-sm">{{ personRole(person.role) }}</p>
                    <p class="text-2xl font-black line-clamp-2 leading-6 mt-0.5">
                        {{ person.person?.name }}
                    </p>
                    <p class="leading-4 line-clamp-1 text-sm mt-0.5">{{ person.role_details }}</p>
                </div>
            </NuxtLink>
        </div>

        <div v-else class="flex flex-col gap-5 mt-5">
            <div class="flex flex-wrap gap-2.5">
                <UButton label="Все"
                         :color="activeRole == null ? 'primary' : 'gray'"
                         @click="activeRole = null"/>

                <UButton v-for="role in roles.filter(_role => people.filter(person => person.role == _role).length > 0)"
                         :label="personRole(role)"
                         :color="activeRole == role ? 'primary' : 'gray'"
                         @click="activeRole = role"/>
            </div>

            <div v-for="role in roles.filter(_role => people.filter(person => person.role == _role).length > 0 && (activeRole ? _role == activeRole : true))">
                <h3 class="text-lg font-semibold mb-2.5">
                    <span>{{ personRole(role) }}</span>
                    <span class="font-normal ms-1.5 text-neutral-400">{{
                            people.filter(person => person.role == role).length
                        }}</span>
                </h3>

                <div class="flex flex-wrap gap-5">
                    <NuxtLink v-for="person in people.filter(person => person.role == role)"
                              class="flex items-center gap-2.5 w-[250px]"
                              :key="person.id"
                              :to="`/catalog/people/${person.person_id}`">
                        <div
                            :style="`background-image: url(${person.person?.photo ? fileUrl(person.person?.photo) : '/img/person.jpg'})`"
                            class="block rounded-md w-[80px] h-[80px] shrink-0 bg-cover bg-center"/>

                        <div class="font-roboto grow w-0">
                            <p class="text-2xl font-black line-clamp-2 leading-6 mt-0.5">
                                {{ person.person?.name }}
                            </p>
                            <p class="leading-4 line-clamp-1 text-sm mt-0.5">{{ person.role_details }}</p>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </div>

        <div v-if="people.length > 6" class="flex justify-center mt-5">
            <UButton :label="details ? 'Скрыть' : 'Показать больше'"
                     color="neutral"
                     size="xl"
                     @click="details = !details"/>
        </div>
    </div>
</template>

<style scoped>

</style>