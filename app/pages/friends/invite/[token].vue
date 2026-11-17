<script setup lang="ts">
import FriendRepository from "~/repos/management/FriendRepository";
import type {FriendshipState} from "~/resources/management/Friends";
import type UserCard from "~/resources/management/UserCard";

definePageMeta({
    layout: 'management'
});

useSeoMeta({title: 'Приглашение в друзья // ВКинопоиск'});

const route = useRoute();
const token = route.params.token as string;
const auth  = useToken();
const repo  = new FriendRepository();
const toast = useToast();

const inviter  = ref<UserCard | null>(null);
const state    = ref<FriendshipState | null>(null);
const notFound = ref(false);
const loading  = ref(true);
const accepting = ref(false);

onMounted(async () => {
    // Гость: на вход и обратно сюда же.
    if (!auth.value) {
        backAfterLogin();
        return;
    }

    try {
        const result  = await repo.previewInvite(token);
        inviter.value = result.user;
        state.value   = result.state;
    } catch {
        notFound.value = true;
    } finally {
        loading.value = false;
    }
});

async function accept() {
    accepting.value = true;

    try {
        const result = await repo.acceptInvite(token);
        state.value  = result.state;
        toast.add({title: `${result.user.name} теперь ваш друг`});
    } catch (err: any) {
        toast.add({title: 'Ошибка', description: err?.data?.message || err.message, color: 'error'});
    } finally {
        accepting.value = false;
    }
}
</script>

<template>
    <UMain>
        <UContainer class="py-16 flex justify-center">
            <div class="w-full max-w-md flex flex-col items-center gap-5 text-center p-8 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <template v-if="loading">
                    <USkeleton class="w-20 h-20 rounded-full"/>
                    <USkeleton class="w-48 h-6"/>
                </template>

                <template v-else-if="notFound">
                    <UIcon name="i-heroicons-link-slash-20-solid" class="w-12 h-12 text-neutral-400"/>
                    <div>
                        <h1 class="text-xl font-bold">Ссылка не работает</h1>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Её, видимо, заменили на новую. Попросите прислать свежую.
                        </p>
                    </div>
                </template>

                <template v-else-if="inviter">
                    <div class="flex w-20 h-20 bg-linear-to-tr from-orange-700 to-fuchsia-400 rounded-full">
                        <span class="m-auto text-3xl font-bold text-white uppercase">{{ inviter.name.slice(0, 1) }}</span>
                    </div>

                    <template v-if="state === 'self'">
                        <div>
                            <h1 class="text-xl font-bold">Это ваша ссылка</h1>
                            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Отправьте её другу.</p>
                        </div>
                        <UButton color="neutral" variant="subtle" to="/friends">К друзьям</UButton>
                    </template>

                    <template v-else-if="state === 'friends'">
                        <div>
                            <h1 class="text-xl font-bold">Вы с {{ inviter.name }} друзья</h1>
                            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Теперь можно планировать совместный просмотр.
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <UButton class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200" icon="i-heroicons-play-circle-20-solid" to="/plans">
                                Что смотрим
                            </UButton>
                            <UButton color="neutral" variant="subtle" to="/friends">Друзья</UButton>
                        </div>
                    </template>

                    <template v-else>
                        <div>
                            <h1 class="text-xl font-bold">{{ inviter.name }} зовёт в друзья</h1>
                            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Друзья видят общие планы на просмотр и могут добавлять в них тайтлы.
                            </p>
                        </div>
                        <UButton size="lg"
                                 icon="i-heroicons-user-plus-20-solid"
                                 class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                                 :loading="accepting"
                                 @click="accept">
                            Добавить в друзья
                        </UButton>
                    </template>
                </template>
            </div>
        </UContainer>
    </UMain>
</template>
