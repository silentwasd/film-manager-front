<script setup lang="ts">
import PersonRepository from "~/repos/PersonRepository";
import type PersonResource from "~/resources/PersonResource";

const shown  = defineModel<boolean>({default: () => false});
const search = ref<string>('');

defineEmits<{
    (e: 'picked', person: PersonResource): void
}>();

const personRepo                     = new PersonRepository();
const {data: people, clear, refresh} = await personRepo.lazyList(() => ({
    name          : search.value,
    sort_column   : 'films_count',
    sort_direction: 'desc',
    per_page      : 10
}));

watch(shown, (value) => {
    if (!value) {
        search.value = '';
        clear();
    } else {
        refresh();
    }
});

function makeResource(): PersonResource {
    return {
        id           : 0,
        name         : '',
        original_name: '',
        birth_date   : null,
        death_date   : null,
        sex          : null,
        photo        : null,
        country_id   : null
    };
}

const editPerson = ref<PersonResource>();
</script>

<template>
    <UModal v-model="shown" :ui="{container: 'items-start sm:items-start'}">
        <UCard :ui="{ring: '', body: {padding: 'sm:p-2.5'}}">
            <div class="flex gap-2.5">
                <UInput placeholder="Поиск..."
                        v-model="search"
                        class="grow"/>

                <div class="shrink-0">
                    <UTooltip text="Создать">
                        <UButton icon="i-heroicons-plus-16-solid"
                                 color="gray"
                                 @click="editPerson = makeResource()"/>
                    </UTooltip>
                </div>
            </div>

            <div v-if="(people?.data ?? []).length > 0"
                 class="flex flex-col pt-2.5">
                <div v-for="person in (people?.data ?? [])"
                     :key="person.id"
                     class="flex items-center gap-2 p-1.5 rounded hover:bg-gray-800 cursor-pointer select-none"
                     @click="$emit('picked', person); shown = false;">
                    <div class="w-12 h-12 bg-cover bg-center bg-no-repeat rounded shrink-0"
                         :style="`background-image: url(${person.photo ? fileUrl(person.photo) : '/img/person.jpg'});`"></div>

                    <div class="grow">
                        <p class="font-medium text-sm leading-4 line-clamp-1">{{ person.name }}</p>

                        <p class="text-xs line-clamp-1 leading-4">
                            {{ (person.roles ?? []).map(role => personRole(role)).join(', ') }}
                        </p>

                        <p v-if="person.birth_date || person.death_date"
                           class="text-xs line-clamp-1 leading-4">
                            <NuxtTime :datetime="person.birth_date" year="numeric"/>
                            <template v-if="person.death_date">
                                -
                                <NuxtTime :datetime="person.death_date" year="numeric"/>
                            </template>
                        </p>
                    </div>
                </div>
            </div>
        </UCard>

        <ModalCreatePerson v-model="editPerson" :refresh="refresh"/>
    </UModal>
</template>

<style scoped>

</style>