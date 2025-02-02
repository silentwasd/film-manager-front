<script setup lang="ts">
import type FilmPersonResource from "~/resources/FilmPersonResource";

defineProps<{
    people: FilmPersonResource[]
}>();

const details = ref<boolean>(false);
</script>

<template>
    <div>
        <div class="flex flex-wrap gap-5 mt-5">
            <NuxtLink v-for="person in people.slice(0, details ? people.length : 6)"
                      class="flex items-center gap-2.5 w-[250px]"
                      :key="person.id"
                      :to="`/catalog/people/${person.person_id}`">
                <div :style="`background-image: url(${person.person?.photo ? fileUrl(person.person?.photo) : '/img/person.jpg'})`"
                     class="block rounded-md w-[80px] h-[80px] shrink-0 bg-cover bg-center"/>

                <div class="font-roboto">
                    <p class="font-light leading-3 text-sm">{{ personRole(person.role) }}</p>
                    <p class="text-2xl font-black line-clamp-2 leading-6 mt-0.5">
                        {{ person.person?.name }}
                    </p>
                    <p class="leading-4 line-clamp-1 text-sm mt-0.5">{{ person.role_details }}</p>
                </div>
            </NuxtLink>
        </div>

        <div v-if="people.length > 6" class="flex justify-center mt-2.5">
            <UButton :icon="details ? 'i-heroicons-chevron-double-up' : 'i-heroicons-chevron-double-down'"
                     color="gray"
                     size="xl"
                     :ui="{rounded: 'rounded-full'}"
                     @click="details = !details"/>
        </div>
    </div>
</template>

<style scoped>

</style>