<script setup lang="ts">
import UserRepository from "~/repos/public/UserRepository";
import type UserResource from "~/resources/public/UserResource";

definePageMeta({
    layout: 'management'
});

const config = useRuntimeConfig();
const route  = useRoute();
const key    = route.params.key as string;

const repo                    = new UserRepository();
const {data: response, error} = await repo.show(key);

if (error.value || !response.value?.data) {
    throw createError({
        statusCode: 404,
        message   : 'Профиль не найден',
        fatal     : true
    });
}

const user = computed<UserResource>(() => response.value!.data);

const collections = computed(() => user.value.collections ?? []);

// Обычные константы, а не computed: данные статичны после await, а ленивый
// computed вычислился бы при резолве head уже вне setup-контекста.
const description = `Коллекции пользователя ${user.value.name} на ВКинопоиске.`;
const canonical   = `${config.public.externalUrl}/users/${user.value.public_key}`;

useSeoMeta({
    title        : `${user.value.name} // ВКинопоиск`,
    description  : description,
    ogTitle      : `${user.value.name} // ВКинопоиск`,
    ogDescription: description,
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : canonical,
    ogType       : 'profile',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

useHead({
    link: [{rel: 'canonical', href: canonical}]
});
</script>

<template>
    <UMain>
        <!-- Шапка профиля -->
        <div class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
            <UContainer class="py-8 sm:py-12">
                <div class="flex items-center gap-5">
                    <div class="flex w-20 h-20 bg-linear-to-tr from-orange-700 to-fuchsia-400 rounded-full shrink-0">
                        <span class="m-auto text-3xl font-bold text-white uppercase">
                            {{ user.name.slice(0, 1) }}
                        </span>
                    </div>

                    <div class="grow w-0">
                        <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-medium">
                            Профиль
                        </p>

                        <h1 class="text-2xl sm:text-3xl font-bold mt-1 break-words">{{ user.name }}</h1>

                        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
                            {{ collections.length }}
                            {{ plural(collections.length, 'коллекция', 'коллекции', 'коллекций') }}
                        </p>
                    </div>
                </div>
            </UContainer>
        </div>

        <UContainer class="py-8">
            <div v-if="collections.length === 0"
                 class="flex flex-col items-center gap-2 py-16 text-neutral-500 dark:text-neutral-400">
                <UIcon name="i-heroicons-rectangle-stack-20-solid" class="w-10 h-10"/>
                <p>У пользователя пока нет коллекций, доступных другим.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <NuxtLink v-for="collection in collections"
                          :key="collection.id"
                          class="group flex flex-col gap-2 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800
                                 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                          :to="collection.path">
                    <div class="flex items-start justify-between gap-3">
                        <h2 class="font-semibold text-lg leading-6 group-hover:underline underline-offset-2">
                            {{ collection.name }}
                        </h2>

                        <UIcon :name="collectionVisibility(collection.visibility).icon"
                               class="w-4 h-4 shrink-0 mt-1 text-neutral-400"/>
                    </div>

                    <p v-if="collection.description"
                       class="text-sm text-neutral-600 dark:text-neutral-400 leading-5 line-clamp-3">
                        {{ collection.description }}
                    </p>

                    <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-auto pt-1">
                        {{ collection.films_count ?? 0 }}
                        {{ plural(collection.films_count ?? 0, 'фильм', 'фильма', 'фильмов') }}
                    </p>
                </NuxtLink>
            </div>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>
