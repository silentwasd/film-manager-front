<script setup lang="ts">
import PersonRepository from "~/repos/PersonRepository";
import {PersonRole} from "~/types/enums/PersonRole";
import FilmPersonRepository from "~/repos/FilmPersonRepository";

const props = defineProps<{
    filmId: number
}>();

const filmPersonRepo = new FilmPersonRepository(props.filmId);
const toast          = useToast();

const {data: people, refresh, status} = filmPersonRepo.list(`film.${props.filmId}.people`);

const newRecord = ref<any>({
    person_id   : 0,
    role        : '',
    role_details: ''
});

async function create() {
    if (!newRecord.value.person_id || !newRecord.value.role)
        return;

    try {
        await filmPersonRepo.store({...newRecord.value});
        await refresh();

        newRecord.value = {
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
    }
}
</script>

<template>
    <table class="w-full">
        <tbody>

        <UiFilmPersonRow v-for="person in people?.data ?? []"
                         :film-id="filmId"
                         :person="person"
                         @removed="refresh"/>

        <tr>
            <td class="w-1/3">
                <UiRepoSearchSelectId :repo="new PersonRepository()"
                                      placeholder="Выберите человека из списка"
                                      v-model="newRecord.person_id">
                    <template #default="{option}">
                        <div class="flex items-center gap-2">
                            <img :src="option.photo ? fileUrl(option.photo) : '/img/person.jpg'"
                                 class="w-10 h-10 object-cover rounded shrink-0"/>

                            <div class="grow">
                                <p class="font-medium leading-4">{{ option.name }}</p>
                                <p class="text-xs">{{ option.roles.map(role => personRole(role)).join(', ') }}</p>
                            </div>
                        </div>
                    </template>
                </UiRepoSearchSelectId>
            </td>

            <td class="w-1/3">
                <USelectMenu :items="Object.values(PersonRole)"
                             placeholder="Выберите роль из списка"
                             v-model="newRecord.role">
                    <template #option="{option}">
                        {{ personRole(option) }}
                    </template>

                    <template v-if="newRecord.role" #label>
                        {{ personRole(newRecord.role) }}
                    </template>
                </USelectMenu>
            </td>

            <td class="w-1/3">
                <UInput placeholder="Доп. информация"
                        v-model="newRecord.role_details"/>
            </td>

            <td>
                <UButton icon="i-heroicons-plus"
                         color="neutral"
                         :loading="status == 'pending'"
                         @click="create"/>
            </td>
        </tr>
        </tbody>
    </table>
</template>

<style scoped>

</style>