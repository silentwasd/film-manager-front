<script setup lang="ts">
import type FilmPersonResource from "~/resources/FilmPersonResource";

const props = defineProps<{
    people: FilmPersonResource[]
}>();

const text = computed(() => props.people.slice(0, 3).map((item: FilmPersonResource) => item.person?.name ?? '').join(', '));
</script>

<template>
    {{
        text.length > 40 ? text.slice(0, 40) + '...' : text
    }}
</template>

<style scoped>

</style>