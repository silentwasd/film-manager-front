<script setup lang="ts">
const props = defineProps<{
    title?: string
}>();

const shown = defineModel<boolean>({default: () => false});
</script>

<template>
    <UModal v-model="shown">
        <UCard :ui="{ring: ''}">
            <template #header>
                <div class="flex flex-row">
                    <h3 class="font-semibold text-lg basis-full">
                        <slot name="title">{{ title ?? 'Пум-пум' }}</slot>
                    </h3>

                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="link"
                             square size="xl" :padded="false" @click="shown = false"/>
                </div>
            </template>

            <slot name="default"/>
        </UCard>
    </UModal>
</template>

<style scoped>

</style>