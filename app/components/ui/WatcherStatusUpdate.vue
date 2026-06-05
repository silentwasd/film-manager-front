<script setup lang="ts">
import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";
import type FilmWatcher from "~/resources/FilmWatcher";
import FilmWatcherRepository from "~/repos/FilmWatcherRepository";

const props = defineProps<{
    watcher: FilmWatcher
}>();

const watchStatusOptions = [
    {label: 'Можно посмотреть', id: FilmWatchStatus.ToWatch},
    {label: 'Нужно досмотреть', id: FilmWatchStatus.MustFinish},
    {label: 'Просмотрено', id: FilmWatchStatus.Watched},
    {label: 'Пропущено', id: FilmWatchStatus.Dropped},
];

const updating        = ref<boolean>(false);
const toast           = useToast();
const filmWatcherRepo = new FilmWatcherRepository();

async function update() {
    updating.value = true;

    try {
        await filmWatcherRepo.update(props.watcher);
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        updating.value = false;
    }
}
</script>

<template>
    <USelectMenu :items="watchStatusOptions"
                 :loading="updating"
                 :disabled="updating"
                 v-model="watcher.status"
                 value-key="id"
                 class="w-full"
                 @update:model-value="update"/>
</template>

<style scoped>

</style>