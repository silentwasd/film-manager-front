<script setup lang="ts">
import PersonRepository from "~/repos/PersonRepository";
import {PersonRole} from "~/types/enums/PersonRole";
import FilmPersonRepository from "~/repos/FilmPersonRepository";

const props = defineProps<{
    filmId: number
}>();

const emit = defineEmits<{
    (e: 'added'): void
}>();

const filmPersonRepo = new FilmPersonRepository(props.filmId);
const toast          = useToast();
const loading        = ref<boolean>(false);

const person = ref<any>({
    person_id   : 0,
    role        : '',
    role_details: ''
});

async function create() {
    if (!person.value.person_id || !person.value.role)
        return;

    loading.value = true;

    try {
        await filmPersonRepo.store({...person.value});
        emit('added');

        person.value = {
            person_id   : 0,
            role        : '',
            role_details: ''
        };
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err?.message,
            color      : 'red'
        });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <tr class="group">
        <td class="w-1/3 pe-1.5 pb-2.5 group-last:pb-0">
            <UiRepoSearchSelectId :repo="new PersonRepository()"
                                  placeholder="Выберите человека из списка"
                                  v-model="person.person_id">
                <template #default="{option}">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 bg-cover bg-center bg-no-repeat rounded shrink-0"
                             :style="`background-image: url(${option.photo ? fileUrl(option.photo) : '/img/person.jpg'});`"></div>

                        <div class="grow">
                            <p class="font-medium leading-4">{{ option.name }}</p>
                            <p class="text-xs">{{ option.roles.map(role => personRole(role)).join(', ') }}</p>
                        </div>
                    </div>
                </template>
            </UiRepoSearchSelectId>
        </td>

        <td class="w-1/3 px-1.5 pb-2.5 group-last:pb-0">
            <USelectMenu :options="Object.values(PersonRole)"
                         placeholder="Выберите роль из списка"
                         v-model="person.role">
                <template #option="{option}">
                    {{ personRole(option) }}
                </template>

                <template v-if="person.role" #label>
                    {{ personRole(person.role) }}
                </template>
            </USelectMenu>
        </td>

        <td class="w-1/3 px-1.5 pb-2.5 group-last:pb-0">
            <UInput placeholder="Доп. информация"
                    v-model="person.role_details"/>
        </td>

        <td class="ps-1.5 pb-2.5 group-last:pb-0">
            <UButton icon="i-heroicons-plus"
                     color="gray"
                     :loading="loading"
                     @click="create"/>
        </td>
    </tr>
</template>

<style scoped>

</style>