<script setup lang="ts">
const name = defineModel<string>();
</script>

<template>
    <UInput placeholder="Поиск..."
            v-model="name"
            icon="i-heroicons-magnifying-glass"
            class="w-full md:max-w-80"/>
</template>

<style scoped>

</style>