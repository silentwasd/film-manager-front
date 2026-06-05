<script setup lang="ts">
const reactionOptions = [
    {label: 'Любой', id: undefined},
    {label: 'Понравилось', id: 1},
    {label: 'Трудно сказать', id: 0},
    {label: 'Не понравилось', id: -1}
];

const model = defineModel<number | undefined>({default: () => undefined});
</script>

<template>
    <USelectMenu :items="reactionOptions"
                 :placeholder="model === undefined ? 'Ваша реакция' : undefined"
                 class="w-full md:w-auto"
                 value-key="id"
                 v-model="model"/>
</template>

<style scoped>

</style>