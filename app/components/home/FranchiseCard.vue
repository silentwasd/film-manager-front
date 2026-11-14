<script setup lang="ts">
import type {HomeFranchise} from "~/resources/public/HomeResource";

/** Франшиза: коллаж из четырёх свежих постеров веером, число тайтлов и годы. */
const props = defineProps<{
    franchise: HomeFranchise;
}>();

const years = computed(() => {
    const {from, to} = props.franchise;

    if (!from) return '';
    return from === to ? `${from}` : `${from}–${to}`;
});

// Веер: крайние постеры повёрнуты и сдвинуты, центр — поверх.
const FAN = [
    'left-[4%] rotate-[-9deg] z-0',
    'left-[24%] rotate-[-3deg] z-10',
    'left-[44%] rotate-[3deg] z-20',
    'left-[62%] rotate-[9deg] z-30'
];
</script>

<template>
    <NuxtLink :to="`/catalog/franchises/${franchise.id}`"
              class="group shrink-0 snap-start w-[230px] sm:w-[260px] rounded-xl p-3 bg-elevated/60 ring-1 ring-default
                     transition hover:ring-primary">
        <div class="relative h-[150px] mb-3">
            <div v-for="(cover, i) in franchise.covers"
                 :key="cover"
                 class="absolute top-2 w-[35%] aspect-[2/3] rounded-md overflow-hidden shadow-lg shadow-black/40 ring-1 ring-black/20
                        transition duration-300 group-hover:-translate-y-1"
                 :class="FAN[i + (4 - franchise.covers.length)]">
                <img :src="fileUrl(cover)" alt="" loading="lazy" draggable="false" class="size-full object-cover"/>
            </div>
        </div>

        <p class="font-semibold leading-5 line-clamp-1 group-hover:text-primary transition">{{ franchise.name }}</p>
        <p class="mt-0.5 text-xs text-muted">
            {{ franchise.count }} {{ plural(franchise.count, 'тайтл', 'тайтла', 'тайтлов') }}<template v-if="years"> · {{ years }}</template>
        </p>
    </NuxtLink>
</template>
