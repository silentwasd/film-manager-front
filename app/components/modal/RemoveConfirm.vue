<script setup lang="ts">
defineProps<{
    opened: boolean,
    removing?: boolean
}>();

const emit = defineEmits<{
    (e: 'confirm'): void,
    (e: 'cancel'): void
}>();
</script>

<template>
    <UModal :open="opened" @update:open="$event ? null : emit('cancel')">
        <template #content>
            <div class="flex flex-row items-center p-5 border-b dark:border-b-neutral-700">
                <h3 class="font-semibold text-lg basis-full">Подтвердите действие</h3>

                <UButton icon="i-heroicons-x-mark" color="neutral" variant="link"
                         square size="xl" @click="emit('cancel')"/>
            </div>

            <div class="p-5">
                <slot>
                    <p>Вы действительно хотите удалить элемент?</p>
                </slot>
            </div>

            <div class="flex items-center justify-end p-5 border-t dark:border-t-neutral-700">
                <UButton color="error" class="dark:bg-error-400 dark:hover:bg-error-300"
                         :loading="removing"
                         @click="emit('confirm')">
                    Подтвердить
                </UButton>
                <UButton color="neutral" class="ms-2.5"
                         :disabled="removing"
                         @click="emit('cancel')">Отменить</UButton>
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>
