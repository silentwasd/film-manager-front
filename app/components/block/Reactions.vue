<script setup lang="ts">
import type FeedbackResource from "~/resources/FeedbackResource";

const props = defineProps<{
    items: FeedbackResource[]
}>();

const total    = computed<number>(() => props.items.filter(item => item.reaction != 0).length);
const likes    = computed<number>(() => props.items.map(item => item.reaction).filter(reaction => reaction > 0).reduce((prev, cur) => prev + cur, 0));
const dislikes = computed<number>(() => Math.abs(props.items.map(item => item.reaction).filter(reaction => reaction < 0).reduce((prev, cur) => prev + cur, 0)));

const likesPercent    = computed<number>(() => total.value ? (likes.value / total.value) * 100 : 0);
const dislikesPercent = computed<number>(() => total.value ? (dislikes.value / total.value) * 100 : 0);
</script>

<template>
    <div class="space-y-2">
        <div class="flex h-3 w-full overflow-hidden rounded-full bg-elevated">
            <div class="bg-success transition-all" :style="{ width: likesPercent + '%' }"/>
            <div class="bg-error transition-all" :style="{ width: dislikesPercent + '%' }"/>
        </div>

        <div class="flex flex-col gap-1 text-sm">
            <span class="flex items-center gap-1 text-success">
                <UIcon name="i-heroicons-hand-thumb-up-16-solid"/>
                Понравилось {{ likes }}
            </span>

            <span class="flex items-center gap-1 text-error">
                <UIcon name="i-heroicons-hand-thumb-down-16-solid"/>
                Не понравилось {{ dislikes }}
            </span>
        </div>
    </div>
</template>

<style scoped>

</style>