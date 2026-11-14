<script setup lang="ts">
import type {HomeReview} from "~/resources/public/HomeResource";

/** Свежий отзыв: кто, о чём, с какой реакцией. Постер ведёт на фильм. */
const props = defineProps<{
    review: HomeReview;
}>();

const reaction = computed(() => {
    switch (props.review.reaction) {
        case 1:
            return {icon: 'i-lucide-thumbs-up', classes: 'text-emerald-500 bg-emerald-500/10', label: 'Понравилось'};
        case -1:
            return {icon: 'i-lucide-thumbs-down', classes: 'text-rose-500 bg-rose-500/10', label: 'Не понравилось'};
        default:
            return {icon: 'i-lucide-meh', classes: 'text-amber-500 bg-amber-500/10', label: 'Нейтрально'};
    }
});

const when = computed(() => {
    const days = Math.floor((Date.now() - new Date(props.review.updated_at).getTime()) / 86_400_000);

    if (days <= 0) return 'сегодня';
    if (days === 1) return 'вчера';
    if (days < 30) return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;

    return new Date(props.review.updated_at).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
});
</script>

<template>
    <article class="flex gap-3 rounded-xl p-3 bg-elevated/60 ring-1 ring-default transition hover:ring-accented">
        <NuxtLink :to="`/catalog/films/${review.film.id}`" class="shrink-0">
            <img :src="coverThumb(review.film)"
                 :alt="review.film.name"
                 loading="lazy"
                 class="w-14 aspect-[2/3] rounded-md object-cover bg-elevated"/>
        </NuxtLink>

        <div class="min-w-0 grow flex flex-col">
            <div class="flex items-start justify-between gap-2">
                <NuxtLink :to="`/catalog/films/${review.film.id}`"
                          class="font-semibold leading-5 line-clamp-1 hover:text-primary transition">
                    {{ review.film.name }}
                </NuxtLink>

                <span class="shrink-0 flex size-6 items-center justify-center rounded-full"
                      :class="reaction.classes"
                      :title="reaction.label">
                    <UIcon :name="reaction.icon" class="size-3.5"/>
                </span>
            </div>

            <p v-if="review.season" class="text-xs font-medium text-primary">{{ seasonLabel(review.season) }}</p>

            <p class="mt-1 text-sm font-light leading-5 line-clamp-3 grow">«{{ review.text }}»</p>

            <p class="mt-1.5 text-xs text-muted truncate">
                {{ review.user ?? 'Аноним' }} · {{ when }}
            </p>
        </div>
    </article>
</template>
