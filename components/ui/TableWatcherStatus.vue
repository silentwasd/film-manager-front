<script setup lang="ts">
import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

const watchStatusOptions = [
    {label: 'Любой', id: undefined},
    {label: 'Можно посмотреть', id: FilmWatchStatus.ToWatch},
    {label: 'Нужно досмотреть', id: FilmWatchStatus.MustFinish},
    {label: 'Просмотрено', id: FilmWatchStatus.Watched},
    {label: 'Пропущено', id: FilmWatchStatus.Dropped},
];
</script>

<template>
    <USelectMenu :items="watchStatusOptions"
                 class="w-full md:w-auto"
                 value-key="id"/>
</template>

<style scoped>

</style>