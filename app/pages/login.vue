<script setup lang="ts">
import ApiClient from "~/services/ApiClient";

definePageMeta({
    layout    : 'management',
    middleware: 'auth'
});

const config = useRuntimeConfig();

useSeoMeta({
    title        : 'Войти в ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'Войти ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const state = ref({
    email   : '',
    password: ''
});

const loading    = ref<boolean>(false);
const token      = useToken();
const toast      = useToast();
const afterLogin = useCookie<string>('after_login');

const kotonetUrl = computed(() => config.public.apiUrl.replace(/\/api\/?$/, '') + '/auth/kotonet');

async function submit() {
    loading.value = true;

    try {
        const client   = new ApiClient();
        const response = await client.post<{ token: string }>('/login', {
            email   : state.value.email,
            password: state.value.password
        });
        token.value    = response.token;
        await navigateTo(afterLogin.value ? afterLogin.value : '/catalog/films');
        afterLogin.value = '';
    } catch (e: any) {
        toast.add({
            title      : 'Ошибка',
            description: e?.data?.message || e?.message,
            color      : 'error'
        });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <UMain>
        <UContainer class="flex justify-center pt-5 lg:pt-10">
            <UForm :state="state" @submit="submit">
                <div class="flex flex-col gap-5 border dark:border-neutral-800 p-5 rounded-md shadow-xl w-75">
                    <UFormField label="E-mail">
                        <UInput type="email"
                                leading-icon="i-heroicons-at-symbol"
                                placeholder="example@example.com"
                                size="lg"
                                class="w-full"
                                v-model="state.email"/>
                    </UFormField>

                    <UFormField label="Пароль">
                        <UInput type="password"
                                leading-icon="i-heroicons-key"
                                placeholder="••••••••"
                                size="lg"
                                class="w-full"
                                v-model="state.password"/>
                    </UFormField>

                    <div class="flex flex-col gap-2.5">
                        <UButton label="Продолжить"
                                 type="submit"
                                 size="lg"
                                 class="w-full justify-center"
                                 :loading="loading"/>

                        <UButton label="Зарегистрироваться"
                                 type="submit"
                                 size="lg"
                                 color="neutral"
                                 variant="subtle"
                                 class="w-full justify-center"
                                 to="/register"/>

                        <USeparator label="или" class="my-0.5"/>

                        <UButton label="Войти через Kotonet"
                                 size="lg"
                                 color="neutral"
                                 variant="subtle"
                                 class="w-full justify-center"
                                 :to="kotonetUrl"
                                 external/>
                    </div>
                </div>
            </UForm>
        </UContainer>
    </UMain>
</template>

<style scoped>

</style>