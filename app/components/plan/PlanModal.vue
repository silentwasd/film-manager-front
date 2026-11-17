<script setup lang="ts">
import FilmRepository from "~/repos/FilmRepository";
import FriendRepository from "~/repos/management/FriendRepository";
import WatchPlanRepository from "~/repos/management/WatchPlanRepository";
import type UserCard from "~/resources/management/UserCard";
import type WatchPlan from "~/resources/management/WatchPlan";

/**
 * Создание и правка записи планировщика. Без plan — новая запись: фильм
 * выбирается поиском, если не задан снаружи (страница фильма). С plan —
 * правка заметки и состава.
 */
const props = defineProps<{
    plan?: WatchPlan | null,
    film?: { id: number, name: string } | null,
    /** Друг, с которым запись создаётся по умолчанию (фильтр на странице). */
    defaultFriendId?: number | null
}>();

const emit = defineEmits<{ saved: [plan: WatchPlan] }>();

const open = defineModel<boolean>('open', {default: false});

const {state: profile} = useProfile();
const toast            = useToast();
const filmRepo         = new FilmRepository();
const friendRepo       = new FriendRepository();
const planRepo         = new WatchPlanRepository();

const friends       = ref<UserCard[]>([]);
const loadingFriends = ref(false);
const film          = ref<any>();
const selected      = ref<number[]>([]);
const note          = ref('');
const saving        = ref(false);

const isEdit = computed(() => !!props.plan);

// В правке в списке и те, кого позвал не я: они уже в плане, хоть мне и не друзья.
const people = computed<UserCard[]>(() => {
    const list = [...friends.value];

    for (const p of props.plan?.participants ?? []) {
        if (p.id !== profile.value?.id && !list.some(f => f.id === p.id)) {
            list.push(p);
        }
    }

    return list;
});

watch(open, async value => {
    if (!value) {
        return;
    }

    film.value     = undefined;
    note.value     = props.plan?.note ?? '';
    selected.value = props.plan
        ? props.plan.participants.map(p => p.id).filter(id => id !== profile.value?.id)
        : (props.defaultFriendId ? [props.defaultFriendId] : []);

    loadingFriends.value = true;

    try {
        friends.value = (await friendRepo.list()).friends;
    } finally {
        loadingFriends.value = false;
    }
});

function toggle(id: number) {
    selected.value = selected.value.includes(id)
        ? selected.value.filter(x => x !== id)
        : [...selected.value, id];
}

const filmId = computed<number | undefined>(() => props.film?.id ?? film.value?.id);

async function save() {
    saving.value = true;

    try {
        const result = props.plan
            ? await planRepo.update(props.plan.id, {note: note.value || null, participants: selected.value})
            : await planRepo.store(filmId.value!, selected.value, note.value);

        emit('saved', result.data);
        open.value = false;

        toast.add({title: isEdit.value ? 'План обновлён' : 'Добавлено в планы'});
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <UModal v-model:open="open" :dismissible="!saving">
        <template #content>
            <div class="flex flex-row items-center p-5 border-b dark:border-b-neutral-700">
                <h3 class="font-semibold text-lg basis-full">
                    {{ isEdit ? 'Запись в планах' : 'Запланировать просмотр' }}
                </h3>

                <UButton icon="i-heroicons-x-mark"
                         color="neutral"
                         variant="link"
                         square
                         size="xl"
                         :disabled="saving"
                         @click="open = false"/>
            </div>

            <div class="flex flex-col gap-4 p-5">
                <UFormField v-if="!isEdit && !props.film" label="Что смотрим" required>
                    <UiRepoSearchSelect :repo="filmRepo"
                                        placeholder="Выберите фильм или сериал"
                                        class="w-full"
                                        v-model="film"/>
                </UFormField>

                <p v-else class="font-medium">{{ props.plan?.film.name ?? props.film?.name }}</p>

                <UFormField label="С кем"
                            :help="people.length ? 'Запись появится у каждого из них, и любой сможет её двигать.' : undefined">
                    <div v-if="loadingFriends" class="flex gap-2">
                        <USkeleton v-for="i in 3" :key="i" class="h-8 w-24"/>
                    </div>

                    <div v-else-if="people.length" class="flex flex-wrap gap-2">
                        <UButton v-for="person in people"
                                 :key="person.id"
                                 size="sm"
                                 :color="selected.includes(person.id) ? 'primary' : 'neutral'"
                                 :variant="selected.includes(person.id) ? 'solid' : 'subtle'"
                                 :icon="selected.includes(person.id) ? 'i-heroicons-check-20-solid' : 'i-heroicons-user-20-solid'"
                                 @click="toggle(person.id)">
                            {{ person.name }}
                        </UButton>
                    </div>

                    <p v-else class="text-sm text-neutral-500 dark:text-neutral-400">
                        Друзей пока нет — запись будет только вашей.
                        <NuxtLink to="/friends" class="underline underline-offset-2">Позвать друзей</NuxtLink>
                    </p>
                </UFormField>

                <UFormField label="Заметка">
                    <UInput v-model="note"
                            placeholder="Например: с субтитрами, по выходным"
                            class="w-full"
                            :maxlength="255"/>
                </UFormField>
            </div>

            <div class="flex items-center justify-end gap-2.5 p-5 border-t dark:border-t-neutral-700">
                <UButton :loading="saving"
                         :disabled="!isEdit && !filmId"
                         class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                         @click="save">
                    {{ isEdit ? 'Сохранить' : 'Запланировать' }}
                </UButton>

                <UButton color="neutral" :disabled="saving" @click="open = false">
                    Отменить
                </UButton>
            </div>
        </template>
    </UModal>
</template>
