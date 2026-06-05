<script setup lang="ts">
import ProfileRepository from "~/repos/management/ProfileRepository";
import {UserRole} from "~/types/enums/UserRole";

const token = useToken();

useHead({
    link: [
        {
            rel  : 'icon',
            href : '/icon/light.png',
            media: '(prefers-color-scheme: light)'
        },
        {
            rel  : 'icon',
            href : '/icon/dark.png',
            media: '(prefers-color-scheme: dark)'
        }
    ]
});

const {state: profile, logout} = useProfile();

const nav = computed(() => [{
    label  : 'Каталог',
    icon   : 'i-heroicons-folder-open-20-solid',
    to     : '/catalog/films',
    visible: profile.value
}, {
    label  : 'Мои фильмы',
    icon   : 'i-heroicons-film-16-solid',
    to     : '/catalog/my-films',
    visible: profile.value
}, {
    label   : 'Справочники',
    icon    : 'i-heroicons-inbox-stack-20-solid',
    children: [{
        label: 'Люди',
        icon : 'i-heroicons-users-20-solid',
        to   : '/catalog/people'
    }, {
        label: 'Компании',
        icon : 'i-heroicons-building-library-20-solid',
        to   : '/catalog/companies'
    }, ...profile.value?.role == UserRole.Admin ? [{
        label: 'Жанры',
        icon : 'i-heroicons-fire-16-solid',
        to   : '/catalog/genres'
    }, {
        label: 'Страны',
        icon : 'i-heroicons-flag-20-solid',
        to   : '/catalog/countries'
    }, {
        label: 'Теги',
        icon : 'i-heroicons-hashtag-solid',
        to   : '/catalog/tags'
    }] : []],
    visible : profile.value
}].filter(item => !item.hasOwnProperty('visible') || item.visible));
</script>

<template>
    <Head>
        <title>ВКинопоиск</title>
    </Head>

    <div>
        <UHeader>
            <template #title>
                <div class="flex items-center gap-2.5">
                    <UIcon name="i-heroicons-film" class="text-3xl shrink-0"/>
                    <h1 class="grow font-roboto font-black">ВКинопоиск</h1>
                </div>
            </template>

            <UNavigationMenu :items="nav"/>

            <template #right>
                <UColorModeButton color="neutral" variant="link"/>

                <UButton v-if="profile"
                         icon="i-heroicons-arrow-right-start-on-rectangle-20-solid"
                         variant="link"
                         color="neutral"
                         @click="logout"/>

                <UButton v-else
                         icon="i-heroicons-arrow-right-end-on-rectangle-20-solid"
                         variant="link"
                         color="neutral"
                         to="/login"/>
            </template>
        </UHeader>

        <slot/>

        <UFooter class="bg-neutral-200 dark:bg-neutral-800">
            <template #left>
                <p class="font-roboto text-sm">Сервис не имеет никакого отношения к Кинопоиску!</p>
            </template>

            <template #right>
                <UButton icon="i-simple-icons-telegram"
                         color="neutral"
                         variant="ghost"
                         to="https://t.me/vkinopoiskruch"
                         target="_blank"/>

                <UButton icon="i-simple-icons-github"
                         color="neutral"
                         variant="ghost"
                         to="https://github.com/silentwasd/film-manager"
                         target="_blank"/>
            </template>
        </UFooter>
    </div>
</template>