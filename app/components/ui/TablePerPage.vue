<script setup lang="ts">
const perPage = defineModel<number>();
</script>

<template>
    <USelectMenu class="w-full md:w-auto"
                 :items="[5, 10, 15, 25, 30]"
                 v-model="perPage">
        <template #default>
            Показать {{ perPage }} записей
        </template>
    </USelectMenu>
</template>

<style scoped>

</style>