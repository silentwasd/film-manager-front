<script setup lang="ts">
import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";
import FilmWatcherRepository from "~/repos/FilmWatcherRepository";

const props = defineProps<{
    filmId: number
}>();

const watchStatusOptions = [
    {label: 'Можно посмотреть', id: FilmWatchStatus.ToWatch},
    {label: 'Нужно досмотреть', id: FilmWatchStatus.MustFinish},
    {label: 'Просмотрено', id: FilmWatchStatus.Watched},
    {label: 'Пропущено', id: FilmWatchStatus.Dropped},
];

const repo = new FilmWatcherRepository();

const watcherId = ref<number>(0);
const status    = ref<FilmWatchStatus | undefined>();
const updating  = ref<boolean>(false);
const ready     = ref<boolean>(false);

async function load() {
    ready.value = false;

    try {
        const data      = await repo.byFilm(props.filmId);
        watcherId.value = data.data.id;
        status.value    = data.data.status;
    } catch {
        status.value = undefined;
    } finally {
        ready.value = true;
    }
}

async function create() {
    updating.value = true;

    try {
        await repo.store({film_id: props.filmId, status: FilmWatchStatus.ToWatch});
        await load();
    } catch {
        status.value = undefined;
    } finally {
        updating.value = false;
    }
}

async function update(value: FilmWatchStatus) {
    updating.value = true;

    try {
        await repo.update({id: watcherId.value, status: value});
        status.value = value;
    } catch {
        status.value = undefined;
    } finally {
        updating.value = false;
    }
}

onMounted(async () => {
    await load();
});
</script>

<template>
    <div v-if="ready">
        <USelectMenu v-if="status !== undefined"
                     value-key="id"
                     class="w-full"
                     :items="watchStatusOptions"
                     :loading="updating"
                     :disabled="updating"
                     :model-value="status"
                     @update:model-value="update"/>

        <UButton v-else
                 color="neutral"
                 label="В мои фильмы"
                 icon="i-heroicons-plus"
                 class="w-full"
                 :loading="updating"
                 @click="create"/>
    </div>

    <USkeleton v-else class="w-full h-8"/>
</template>

<style scoped>

</style>