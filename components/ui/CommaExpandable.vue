<script setup lang="ts">
defineProps<{
    items: any[]
}>();

const expanded = ref<boolean>(false);
</script>

<template>
    <div>
        <template v-for="(item, index) in items.slice(0, expanded ? items.length : 3)">
            {{ index > 0 ? ', ' : '' }}
            <slot :item="item" :index="index"/>
        </template>

        <a v-if="!expanded && items.length > 3"
           class="text-gray-500 hover:text-gray-400 ms-1.5"
           href="#"
           @click="expanded = true">еще {{ items.length - 3 }}</a>

        <a v-else-if="expanded && items.length > 3"
           class="text-gray-500 hover:text-gray-400 ms-1.5"
           href="#"
           @click="expanded = false">скрыть</a>
    </div>
</template>

<style scoped>

</style>