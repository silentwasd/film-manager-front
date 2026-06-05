<script setup lang="ts">
import FilmRepository from "~/repos/FilmRepository";

definePageMeta({
    layout    : 'management',
    middleware: 'auth'
});

const route  = useRoute();
const filmId = parseInt(route.params.film as string);

const filmRepo              = new FilmRepository();
const {data: film, refresh} = await filmRepo.show(`film.${filmId}`, filmId);

const baseUrl = `/catalog/films/${filmId}/edit`;

const nav = [{
    label: 'Основное',
    to   : baseUrl,
    exact: true
}, {
    label: 'Люди',
    to   : `${baseUrl}/people`
}];

const save   = ref<() => Promise<void>>();
const saving = ref<boolean>(false);

const backLink = ref<string>('/catalog/films');

onMounted(() => {
    const back = window.history.state?.back;

    if (!back)
        return;

    if (new URL('https://test.com' + back).pathname == '/catalog/films')
        backLink.value = back;
});
</script>

<template>
    <UMain>
        <UContainer v-if="film" class="flex flex-col h-full">
            <div class="sticky top-16 z-10 bg-white dark:bg-neutral-900 pt-5">
                <div class="flex items-center gap-5">
                    <div class="shrink-0">
                        <UTooltip text="Вернуться в каталог">
                            <UButton color="neutral"
                                     icon="i-heroicons-chevron-left"
                                     variant="link"
                                     :padded="false"
                                     size="xl"
                                     :to="backLink"/>
                        </UTooltip>
                    </div>

                    <div class="grow">
                        <p class="leading-3 text-sm">{{ filmFormat(film.data.format) }}</p>
                        <h1 class="text-xl font-semibold">{{ film.data.name }}</h1>
                    </div>

                    <UButton v-if="save"
                             color="neutral"
                             label="Сохранить"
                             icon="i-heroicons-check"
                             size="lg"
                             class="shrink-0"
                             :loading="saving"
                             @click="save"/>
                </div>

                <UNavigationMenu :items="nav"/>

                <USeparator/>
            </div>

            <NuxtPage :film="film.data ?? []"
                      :refresh="refresh"
                      v-model:save="save"
                      v-model:saving="saving"/>
        </UContainer>
    </UMain>
</template>

<style scoped>
</style>