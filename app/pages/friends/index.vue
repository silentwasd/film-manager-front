<script setup lang="ts">
import FriendRepository from "~/repos/management/FriendRepository";
import type UserCard from "~/resources/management/UserCard";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

useSeoMeta({title: 'Друзья // ВКинопоиск'});

const repo  = new FriendRepository();
const toast = useToast();

const {data, refresh} = await useAsyncData('friends', () => repo.list());

// Заявка пришла или друг принял — список обновится сам.
useLive('friends', () => refresh());

const friends  = computed(() => data.value?.friends ?? []);
const incoming = computed(() => data.value?.incoming ?? []);
const outgoing = computed(() => data.value?.outgoing ?? []);

const busy = ref<{ [id: number]: boolean }>({});

async function act(user: UserCard, action: () => Promise<unknown>, success: string) {
    busy.value[user.id] = true;

    try {
        await action();
        await refresh();
        toast.add({title: success});
    } catch (err: any) {
        toast.add({title: 'Ошибка', description: err?.data?.message || err.message, color: 'error'});
    } finally {
        busy.value[user.id] = false;
    }
}

// --- Ссылка-приглашение: заводится при первом открытии ---
const inviteUrl = ref<string>('');
const resetting = ref(false);
const copied    = ref(false);

onMounted(async () => {
    inviteUrl.value = (await repo.invite()).url;
});

async function copyInvite() {
    try {
        await navigator.clipboard.writeText(inviteUrl.value);
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    } catch {
        toast.add({title: 'Не удалось скопировать', description: inviteUrl.value, color: 'error'});
    }
}

async function resetInvite() {
    resetting.value = true;

    try {
        inviteUrl.value = (await repo.resetInvite()).url;
        toast.add({title: 'Новая ссылка готова', description: 'Старая больше не работает.'});
    } finally {
        resetting.value = false;
    }
}
</script>

<template>
    <UiManagementMain>
        <div class="flex flex-col gap-6 grow h-0 overflow-auto max-w-3xl">
            <!-- Приглашение -->
            <section class="flex flex-col gap-3 p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                <div>
                    <h2 class="font-semibold">Позвать друга</h2>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                        Отправьте ссылку — кто её откроет, сразу станет вашим другом, без заявки.
                        Ещё можно нажать «Добавить в друзья» в чужом профиле.
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <UInput :model-value="inviteUrl"
                            readonly
                            class="grow"
                            :loading="!inviteUrl"
                            @focus="($event.target as HTMLInputElement).select()"/>

                    <UButton :icon="copied ? 'i-heroicons-check-20-solid' : 'i-heroicons-link-20-solid'"
                             color="neutral"
                             variant="subtle"
                             :disabled="!inviteUrl"
                             @click="copyInvite">
                        {{ copied ? 'Скопировано' : 'Скопировать' }}
                    </UButton>

                    <UTooltip text="Новая ссылка — старая перестанет работать">
                        <UButton icon="i-heroicons-arrow-path-20-solid"
                                 color="neutral"
                                 variant="subtle"
                                 square
                                 :loading="resetting"
                                 @click="resetInvite"/>
                    </UTooltip>
                </div>
            </section>

            <!-- Входящие -->
            <section v-if="incoming.length" class="flex flex-col gap-2">
                <h2 class="font-semibold">Хотят дружить <span class="text-neutral-400 font-normal">{{ incoming.length }}</span></h2>

                <div v-for="user in incoming" :key="user.id"
                     class="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <UiUserChip :user="user"/>

                    <div class="flex gap-2">
                        <UButton size="sm"
                                 class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                                 :loading="busy[user.id] ?? false"
                                 @click="act(user, () => repo.accept(user.id), `${user.name} теперь ваш друг`)">
                            Принять
                        </UButton>

                        <UButton size="sm"
                                 color="neutral"
                                 variant="subtle"
                                 :disabled="busy[user.id] ?? false"
                                 @click="act(user, () => repo.remove(user.id), 'Заявка отклонена')">
                            Отклонить
                        </UButton>
                    </div>
                </div>
            </section>

            <!-- Друзья -->
            <section class="flex flex-col gap-2">
                <h2 class="font-semibold">Друзья <span class="text-neutral-400 font-normal">{{ friends.length }}</span></h2>

                <p v-if="!friends.length" class="text-sm text-neutral-500 dark:text-neutral-400 py-4">
                    Пока никого. С друзьями можно планировать совместный просмотр.
                </p>

                <div v-for="user in friends" :key="user.id"
                     class="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <UiUserChip :user="user"/>

                    <div class="flex gap-2">
                        <UTooltip text="Планы с ним">
                            <UButton size="sm"
                                     color="neutral"
                                     variant="subtle"
                                     icon="i-heroicons-play-circle-20-solid"
                                     square
                                     :to="`/plans?friend=${user.id}`"/>
                        </UTooltip>

                        <UTooltip text="Удалить из друзей — совместные планы останутся">
                            <UButton size="sm"
                                     color="neutral"
                                     variant="subtle"
                                     icon="i-heroicons-user-minus-20-solid"
                                     square
                                     :loading="busy[user.id] ?? false"
                                     @click="act(user, () => repo.remove(user.id), `${user.name} удалён из друзей`)"/>
                        </UTooltip>
                    </div>
                </div>
            </section>

            <!-- Исходящие -->
            <section v-if="outgoing.length" class="flex flex-col gap-2">
                <h2 class="font-semibold">Ждут ответа <span class="text-neutral-400 font-normal">{{ outgoing.length }}</span></h2>

                <div v-for="user in outgoing" :key="user.id"
                     class="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <UiUserChip :user="user"/>

                    <UButton size="sm"
                             color="neutral"
                             variant="subtle"
                             :loading="busy[user.id] ?? false"
                             @click="act(user, () => repo.remove(user.id), 'Заявка отозвана')">
                        Отозвать
                    </UButton>
                </div>
            </section>
        </div>
    </UiManagementMain>
</template>
