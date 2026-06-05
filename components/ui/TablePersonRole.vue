<script setup lang="ts">
import {PersonRole} from "~/types/enums/PersonRole";

const roleOptions = [
    {label: 'Любая', id: undefined},
    ...Object.values(PersonRole).map(value => ({label: personRole(value), id: value}))
];
</script>

<template>
    <USelectMenu :items="roleOptions"
                 class="w-full md:w-auto"
                 value-key="id"/>
</template>

<style scoped>

</style>