<script setup lang="ts">
import {FilmFormat} from "~/types/enums/FilmFormat";

const filmFormatOptions = [
    {label: 'Любой', id: undefined},
    ...Object.values(FilmFormat).map(value => ({label: filmFormat(value), id: value}))
];
</script>

<template>
    <USelectMenu :items="filmFormatOptions"
                 value-key="id"/>
</template>

<style scoped>

</style>