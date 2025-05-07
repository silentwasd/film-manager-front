<script setup lang="ts">
import {PersonSex} from "~/types/enums/PersonSex";
import CountryRepository from "~/repos/management/CountryRepository";
import PersonRepository from "~/repos/PersonRepository";
import type PersonResource from "~/resources/PersonResource";

const props = defineProps<{
    refresh: () => Promise<void>
}>();

const personRepo = new PersonRepository();
const editRow    = defineModel<PersonResource | null>();

async function save(state: any) {
    if (state.id > 0) {
        await personRepo.update({...state, ...state.photo instanceof File ? {photo: state.photo} : {photo: null}});
    } else {
        await personRepo.store(state);
    }

    await props.refresh();
}
</script>

<template>
    <ModalEditModel v-model="editRow"
                    :readonly="!(editRow?.can_edit ?? true)"
                    :save="save">
        <template #create-title>Новый человек</template>
        <template #edit-title="{state}">Человек #{{ state.id }}</template>

        <template #default="{state}">
            <UFormGroup label="Полное имя" name="name" required>
                <UInput v-model="state.name" placeholder="Стэнли Кубрик"/>
            </UFormGroup>

            <UFormGroup label="Оригинальное полное имя" name="original_name" required>
                <UInput v-model="state.original_name" placeholder="Stanley Kubrick"/>
            </UFormGroup>

            <UFormGroup label="Дата рождения" name="birth_date">
                <UInput type="date"
                        :model-value="state.birth_date ? undater(state.birth_date) : null"
                        @update:model-value="state.birth_date = dater($event)"/>
            </UFormGroup>

            <UFormGroup label="Дата смерти" name="death_date">
                <UInput type="date"
                        :model-value="state.death_date ? undater(state.death_date) : null"
                        @update:model-value="state.death_date = dater($event)"/>
            </UFormGroup>

            <UFormGroup label="Пол" name="sex">
                <USelectMenu :options="Object.values(PersonSex)"
                             placeholder="Выберите пол из списка"
                             v-model="state.sex">
                    <template #option="{option}">
                        {{ personSex(option) }}
                    </template>

                    <template v-if="state.sex" #label>
                        {{ personSex(state.sex) }}
                    </template>
                </USelectMenu>
            </UFormGroup>

            <UFormGroup label="Фото" name="photo">
                <UInput type="file" @input="state.photo = $event.target.files[0]"/>
            </UFormGroup>

            <UFormGroup label="Страна" name="country_id">
                <UiRepoSearchSelectId :repo="new CountryRepository()"
                                      placeholder="Выберите страну из списка"
                                      v-model="state.country_id">
                </UiRepoSearchSelectId>
            </UFormGroup>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>