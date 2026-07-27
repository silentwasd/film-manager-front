<script setup lang="ts">
import CollectionRepository from "~/repos/public/CollectionRepository";
import type CollectionResource from "~/resources/public/CollectionResource";

definePageMeta({
    layout: 'management'
});

const config        = useRuntimeConfig();
const route         = useRoute();
const userKey       = route.params.key as string;
const collectionKey = route.params.collection as string;

const repo                    = new CollectionRepository();
const {data: response, error} = await repo.showPersonal(userKey, collectionKey);

// Сюда попадают только личные коллекции. Публичная (у неё короткий адрес),
// скрытая, чужая и несуществующая дают одинаковый 404.
if (error.value || !response.value?.data) {
    throw createError({
        statusCode: 404,
        message   : 'Коллекция не найдена',
        fatal     : true
    });
}

const collection = computed<CollectionResource>(() => response.value!.data);

const films = collection.value.films ?? [];

const description = collection.value.description
    || `Подборка из ${films.length} ${plural(films.length, 'фильма', 'фильмов', 'фильмов')}.`;

const firstCover = films[0]?.film?.cover;

const cover = firstCover
    ? fileUrl(firstCover as string)
    : config.public.externalUrl + '/img/cinema.png';

const canonical = config.public.externalUrl + collection.value.path;

useSeoMeta({
    title        : `${collection.value.name} // ВКинопоиск`,
    description  : description,
    ogTitle      : `${collection.value.name} // ВКинопоиск`,
    ogDescription: description,
    ogImage      : cover,
    ogUrl        : canonical,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

useHead({
    // Личные коллекции не индексируются: у них нет места в sitemap,
    // и попадать в выдачу они не должны.
    meta: [{name: 'robots', content: 'noindex, follow'}],
    link: [{rel: 'canonical', href: canonical}]
});
</script>

<template>
    <BlockPublicCollection :collection="collection" :canonical="canonical"/>
</template>

<style scoped>

</style>
