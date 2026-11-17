<script setup lang="ts">
import type UserCard from "~/resources/management/UserCard";
import type WatchPlan from "~/resources/management/WatchPlan";

defineProps<{
    plan: WatchPlan,
    /** Участники кроме меня. */
    others: UserCard[],
    menu: any[],
    busy?: boolean,
    /** Строка под названием: «с 15 нояб · 3-й день». */
    meta?: string,
    /** Номер в очереди. */
    index?: number,
    draggable?: boolean,
    muted?: boolean
}>();
</script>

<template>
    <div class="flex gap-3 p-2.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
         :class="{'opacity-80': muted}">
        <div v-if="draggable" class="drag-handle flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing text-neutral-400 shrink-0">
            <UIcon name="i-heroicons-bars-3" class="w-4 h-4"/>
            <span class="text-[10px] font-mono">{{ index }}</span>
        </div>

        <NuxtLink :to="`/catalog/films/${plan.film.id}`" class="shrink-0">
            <img v-if="plan.film.cover"
                 :src="coverThumb(plan.film)"
                 :alt="plan.film.name"
                 loading="lazy"
                 class="w-12 h-17 object-cover rounded bg-neutral-800"/>

            <div v-else class="flex w-12 h-17 rounded bg-neutral-200 dark:bg-neutral-800">
                <UIcon name="i-heroicons-film" class="w-5 h-5 m-auto text-neutral-500"/>
            </div>
        </NuxtLink>

        <div class="grow w-0 flex flex-col gap-1">
            <div class="flex items-start justify-between gap-2">
                <NuxtLink :to="`/catalog/films/${plan.film.id}`"
                          class="font-medium leading-5 hover:underline underline-offset-2 line-clamp-2">
                    {{ plan.film.name }}
                </NuxtLink>

                <UDropdownMenu :items="menu">
                    <UButton size="xs"
                             color="neutral"
                             variant="ghost"
                             icon="i-heroicons-ellipsis-horizontal-20-solid"
                             square
                             :disabled="busy"
                             class="-mt-0.5 -me-1"/>
                </UDropdownMenu>
            </div>

            <p class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ filmFormat(plan.film.format as any) }}<template v-if="plan.film.produced_year"> · {{ plan.film.produced_year }}</template>
                <template v-if="meta"> · <span class="text-neutral-700 dark:text-neutral-300">{{ meta }}</span></template>
            </p>

            <p v-if="others.length" class="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <UIcon name="i-heroicons-user-group-20-solid" class="w-3.5 h-3.5 shrink-0"/>
                <span class="truncate">с {{ others.map(p => p.name).join(', ') }}</span>
            </p>

            <p v-if="plan.note" class="text-xs italic text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {{ plan.note }}
            </p>

            <div class="flex justify-end mt-auto pt-1">
                <slot/>
            </div>
        </div>
    </div>
</template>
