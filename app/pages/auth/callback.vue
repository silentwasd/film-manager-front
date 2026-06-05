<script setup lang="ts">
definePageMeta({
    layout: 'management'
});

const route      = useRoute();
const token      = useToken();
const toast      = useToast();
const afterLogin = useCookie<string>('after_login');

const incomingToken = route.query.token as string | undefined;

if (incomingToken) {
    token.value = incomingToken;
    await navigateTo(afterLogin.value ? afterLogin.value : '/catalog/films');
    afterLogin.value = '';
} else {
    toast.add({
        title      : 'Ошибка',
        description: 'Не удалось войти через Kotonet',
        color      : 'error'
    });
    await navigateTo('/login');
}
</script>

<template>
    <UMain>
        <UContainer class="flex justify-center pt-5 lg:pt-10">
            <div class="flex items-center gap-2.5">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl"/>
                <span>Выполняется вход…</span>
            </div>
        </UContainer>
    </UMain>
</template>
