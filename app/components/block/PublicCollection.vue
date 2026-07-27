<script setup lang="ts">
import type CollectionResource from "~/resources/public/CollectionResource";

/**
 * Общий рендер страницы коллекции. Используется и коротким адресом публичной
 * коллекции, и вложенным адресом личной — отличается только тем, откуда
 * страница берёт данные, поэтому разметка живёт здесь.
 */
const props = defineProps<{
    collection: CollectionResource,
    /** Абсолютный адрес страницы — для кнопки «Поделиться». */
    canonical: string
}>();

const films = computed(() => props.collection.films ?? []);

const copied = ref(false);

async function copyLink() {
    try {
        await navigator.clipboard.writeText(props.canonical);
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    } catch {
        // Clipboard API недоступен вне https или без разрешения — молча игнорируем.
    }
}
</script>

<template>
    <UMain>
        <!-- Шапка коллекции -->
        <div class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
            <UContainer class="py-8 sm:py-12">
                <div class="flex flex-col sm:flex-row gap-6">
                    <div class="flex w-20 h-20 bg-linear-to-tr from-orange-700 to-fuchsia-400 rounded-xl shrink-0">
                        <UIcon name="i-heroicons-rectangle-stack-20-solid" class="text-5xl m-auto text-white"/>
                    </div>

                    <div class="grow w-0">
                        <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-medium">
                            Коллекция
                        </p>

                        <h1 class="text-2xl sm:text-3xl font-bold mt-1 break-words">{{ collection.name }}</h1>

                        <p v-if="collection.description"
                           class="text-base sm:text-lg leading-6 mt-2 text-neutral-700 dark:text-neutral-300">
                            {{ collection.description }}
                        </p>

                        <div class="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <NuxtLink v-if="collection.author"
                                      class="flex items-center gap-1.5 hover:underline underline-offset-2"
                                      :to="`/users/${collection.author.public_key}`">
                                <UIcon name="i-heroicons-user-20-solid" class="w-4 h-4"/>
                                {{ collection.author.name }}
                            </NuxtLink>

                            <span class="flex items-center gap-1.5">
                                <UIcon name="i-heroicons-film-16-solid" class="w-4 h-4"/>
                                {{ films.length }} {{ plural(films.length, 'фильм', 'фильма', 'фильмов') }}
                            </span>

                            <UButton :icon="copied ? 'i-heroicons-check-20-solid' : 'i-heroicons-link-20-solid'"
                                     :label="copied ? 'Ссылка скопирована' : 'Поделиться'"
                                     color="neutral"
                                     variant="link"
                                     size="xs"
                                     class="px-0"
                                     @click="copyLink"/>
                        </div>
                    </div>
                </div>
            </UContainer>
        </div>

        <UContainer class="py-8">
            <!-- Пустая коллекция -->
            <div v-if="films.length === 0"
                 class="flex flex-col items-center gap-2 py-16 text-neutral-500 dark:text-neutral-400">
                <UIcon name="i-heroicons-film" class="w-10 h-10"/>
                <p>В этой коллекции пока нет фильмов.</p>
            </div>

            <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
                <NuxtLink v-for="(entry, index) in films"
                          :key="entry.film.id"
                          class="group block"
                          :to="`/catalog/films/${entry.film.id}`">
                    <div class="relative">
                        <img v-if="entry.film.cover"
                             :src="fileUrl(entry.film.cover as string)"
                             :alt="entry.film.name"
                             loading="lazy"
                             class="w-full h-50 md:h-62.5 object-contain bg-linear-to-br from-neutral-800 to-neutral-950 rounded-lg"/>

                        <div v-else
                             class="flex w-full h-50 md:h-62.5 bg-linear-to-br from-neutral-800 to-neutral-950 rounded-lg">
                            <UIcon name="i-heroicons-film" class="w-10 h-10 m-auto text-neutral-600"/>
                        </div>

                        <!-- Порядковый номер: коллекция ранжированная, позиция значима -->
                        <span class="absolute top-1.5 left-1.5 flex items-center justify-center min-w-7 h-7 px-1.5
                                     rounded-md bg-neutral-950/75 text-white text-sm font-semibold tabular-nums">
                            {{ index + 1 }}
                        </span>
                    </div>

                    <div class="mt-1.5">
                        <p class="truncate text-lg font-medium leading-5 group-hover:underline underline-offset-2">
                            {{ entry.film.name }}
                        </p>

                        <p class="font-light truncate text-sm">
                            <span>{{ filmFormat(entry.film.format) }}</span>
                            <span class="text-neutral-600 dark:text-neutral-400 italic ms-1">
                                {{ entry.film.produced_year }}
                            </span>
                        </p>

                        <p v-if="entry.note"
                           class="text-sm italic leading-5 mt-1.5 text-neutral-600 dark:text-neutral-400 line-clamp-3">
                            {{ entry.note }}
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>
