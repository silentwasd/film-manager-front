<script setup lang="ts">
const props = defineProps<{
    watch: () => any
}>();

const emit = defineEmits<{
    (e: 'update', value: any): void
}>();

watch(props.watch, value => emit('update', value));
</script>

<template>
</template>

<style scoped>

</style>