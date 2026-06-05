<script setup lang="ts">
defineProps<{
    opened: boolean,
    removing?: boolean,
    count: number
}>();

defineEmits<{
    (e: 'confirm'): void,
    (e: 'cancel'): void
}>();
</script>

<template>
    <UModal :model-value="opened" @update:modelValue="$event ? null : $emit('cancel')">
        <UCard :ui="{ring: ''}">
            <template #header>
                <div class="flex flex-row">
                    <h3 class="font-semibold text-lg basis-full">Подтвердите действие</h3>

                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="link"
                             square size="xl" :padded="false" @click="$emit('cancel')"/>
                </div>
            </template>

            <slot>
                <p>Вы действительно хотите удалить несколько ({{ count }}) элементов?</p>
            </slot>

            <template #footer>
                <div class="flex items-center justify-end">
                    <UButton color="error" class="dark:bg-error-400 dark:hover:bg-error-300"
                             type="submit"
                             :loading="removing"
                             @click="$emit('confirm')">
                        Подтвердить
                    </UButton>
                    <UButton color="neutral" class="ms-2.5"
                             :disabled="removing"
                             @click="$emit('cancel')">Отменить</UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<style scoped>

</style>