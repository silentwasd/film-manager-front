<script setup lang="ts">
// @ts-ignore
import draggable from 'vuedraggable';
import FriendRepository from "~/repos/management/FriendRepository";
import WatchPlanRepository from "~/repos/management/WatchPlanRepository";
import type UserCard from "~/resources/management/UserCard";
import type WatchPlan from "~/resources/management/WatchPlan";
import type {WatchPlanStatus} from "~/resources/management/WatchPlan";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

useSeoMeta({title: 'Смотрим // ВКинопоиск'});

const repo       = new WatchPlanRepository();
const friendRepo = new FriendRepository();
const toast      = useToast();
const {state: profile} = useProfile();

// --- Фильтр по другу (?friend=<id> — ссылка со страницы друзей) ---
const route    = useRoute();
const friendId = ref<number | null>(route.query.friend ? Number(route.query.friend) : null);

const {data: friendsData, refresh: refreshFriends} = await useAsyncData('plans.friends', () => friendRepo.list());
const friends = computed<UserCard[]>(() => friendsData.value?.friends ?? []);

const {data: board, refresh, status: loadStatus} = await useAsyncData(
    'plans.board',
    () => repo.board(friendId.value),
    {watch: [friendId]}
);

// Локальная копия «В планах» для перетаскивания.
const planned = ref<WatchPlan[]>([]);
watch(() => board.value?.planned, value => planned.value = [...(value ?? [])], {immediate: true});

// --- Живые обновления: друг подвинул — перечитываем доску ---
// Пока карточку тащат, список не трогаем: обновим, когда отпустят.
const dragging     = ref(false);
const staleWhileDrag = ref(false);

function liveRefresh() {
    if (dragging.value) {
        staleWhileDrag.value = true;
        return;
    }

    refresh();
}

useLive('plans', liveRefresh);
useLive('friends', () => refreshFriends());

const watching = computed(() => board.value?.watching ?? []);
const watched  = computed(() => board.value?.watched ?? []);

// --- Даты ---
function parseDate(date: string): Date {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y!, m! - 1, d!);
}

function daysBetween(from: string, to: Date): number {
    return Math.round((to.getTime() - parseDate(from).getTime()) / 86_400_000);
}

function shortDate(date: string): string {
    return parseDate(date).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}).replace('.', '');
}

function watchingLabel(plan: WatchPlan): string {
    if (!plan.started_at) {
        return '';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = daysBetween(plan.started_at, today) + 1;

    return day <= 1 ? 'начали сегодня' : `с ${shortDate(plan.started_at)} · ${day}-й день`;
}

function watchedLabel(plan: WatchPlan): string {
    if (!plan.finished_at) {
        return '';
    }

    const days = plan.started_at ? daysBetween(plan.started_at, parseDate(plan.finished_at)) + 1 : 1;

    return days <= 1
        ? `${shortDate(plan.finished_at)} · за один заход`
        : `${shortDate(plan.started_at!)} – ${shortDate(plan.finished_at)} · за ${days} ${plural(days, 'день', 'дня', 'дней')}`;
}

// --- Участники: себя не показываем, остальных — именами ---
function others(plan: WatchPlan): UserCard[] {
    return plan.participants.filter(p => p.id !== profile.value?.id);
}

// --- Действия ---
const busy = ref<{ [id: number]: boolean }>({});

async function run(plan: WatchPlan, action: () => Promise<unknown>, success?: string) {
    busy.value[plan.id] = true;

    try {
        await action();
        await refresh();

        if (success) {
            toast.add({title: success});
        }
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        busy.value[plan.id] = false;
    }
}

const statusToast: Record<WatchPlanStatus, string> = {
    planned : 'Вернули в планы',
    watching: 'Начали смотреть — у всех в «Моих фильмах» «Досмотреть»',
    watched : 'Досмотрели — у всех отмечено «Просмотрено»'
};

async function move(plan: WatchPlan, status: WatchPlanStatus) {
    busy.value[plan.id] = true;

    try {
        await repo.status(plan.id, status, plan.status);
        toast.add({title: statusToast[status]});
    } catch (err: any) {
        // 409 — друг успел переложить запись раньше; показываем, как есть сейчас.
        toast.add(err?.statusCode === 409 || err?.status === 409
            ? {title: 'Запись уже переложили', description: 'Список обновлён.', color: 'warning'}
            : {title: 'Ошибка', description: err?.data?.message || err.message, color: 'error'});
    } finally {
        busy.value[plan.id] = false;
        await refresh();
    }
}

function menu(plan: WatchPlan) {
    const solo = plan.participants.length <= 1;

    return [[
        {label: 'Изменить', icon: 'i-heroicons-pencil-square-20-solid', onSelect: () => edit(plan)},
        ...(plan.status !== 'planned' ? [{
            label   : 'Вернуть в планы',
            icon    : 'i-heroicons-arrow-uturn-left-20-solid',
            onSelect: () => move(plan, 'planned')
        }] : []),
    ], [
        ...(!solo ? [{
            label   : 'Выйти из плана',
            icon    : 'i-heroicons-arrow-right-start-on-rectangle-20-solid',
            onSelect: () => run(plan, () => repo.leave(plan.id), 'Вы вышли из плана — у остальных он остался')
        }] : []),
        {
            label   : solo ? 'Удалить' : 'Удалить у всех',
            icon    : 'i-heroicons-trash-20-solid',
            color   : 'error' as const,
            onSelect: () => run(plan, () => repo.destroy(plan.id), 'Запись удалена')
        }
    ]];
}

// --- Порядок «В планах»: сохраняется сразу после перетаскивания ---
async function saveOrder() {
    dragging.value = false;

    try {
        await repo.reorder(planned.value.map(p => p.id));
    } catch (err: any) {
        toast.add({
            title      : 'Порядок не сохранился',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
        await refresh();
    }

    if (staleWhileDrag.value) {
        staleWhileDrag.value = false;
        await refresh();
    }
}

// --- Модалка ---
const modalOpen = ref(false);
const editing   = ref<WatchPlan | null>(null);

function create() {
    editing.value   = null;
    modalOpen.value = true;
}

function edit(plan: WatchPlan) {
    editing.value   = plan;
    modalOpen.value = true;
}

const columns = computed(() => [
    {key: 'planned', title: 'В планах', icon: 'i-heroicons-queue-list-20-solid', count: planned.value.length},
    {key: 'watching', title: 'Смотрим', icon: 'i-heroicons-play-circle-20-solid', count: watching.value.length},
    {key: 'watched', title: 'Посмотрели', icon: 'i-heroicons-check-circle-20-solid', count: watched.value.length},
]);
</script>

<template>
    <UiManagementMain>
        <div class="flex flex-col gap-5 grow h-0 overflow-auto">
            <!-- Шапка -->
            <div class="flex items-center justify-between gap-4 flex-wrap shrink-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <UButton size="sm"
                             :color="friendId === null ? 'primary' : 'neutral'"
                             :variant="friendId === null ? 'solid' : 'subtle'"
                             @click="friendId = null">
                        Все
                    </UButton>

                    <UButton v-for="friend in friends"
                             :key="friend.id"
                             size="sm"
                             icon="i-heroicons-user-20-solid"
                             :color="friendId === friend.id ? 'primary' : 'neutral'"
                             :variant="friendId === friend.id ? 'solid' : 'subtle'"
                             @click="friendId = friend.id">
                        {{ friend.name }}
                    </UButton>

                    <UButton v-if="friends.length === 0"
                             size="sm"
                             variant="link"
                             color="neutral"
                             icon="i-heroicons-user-plus-20-solid"
                             to="/friends">
                        Позвать друзей
                    </UButton>
                </div>

                <UButton icon="i-heroicons-plus"
                         color="neutral"
                         variant="subtle"
                         @click="create">
                    Запланировать
                </UButton>
            </div>

            <!-- Колонки -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
                 :class="{'opacity-60 transition-opacity': loadStatus === 'pending'}">
                <section v-for="column in columns"
                         :key="column.key"
                         class="flex flex-col gap-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-3">
                    <h2 class="flex items-center gap-2 font-semibold px-1">
                        <UIcon :name="column.icon" class="w-5 h-5 text-neutral-400"/>
                        {{ column.title }}
                        <span class="text-neutral-400 font-normal text-sm">{{ column.count }}</span>
                    </h2>

                    <!-- В планах: перетаскиваемый список -->
                    <draggable v-if="column.key === 'planned'"
                               v-model="planned"
                               item-key="id"
                               handle=".drag-handle"
                               ghost-class="opacity-40"
                               class="flex flex-col gap-2.5 min-h-10"
                               @start="dragging = true"
                               @end="saveOrder">
                        <template #item="{element, index}">
                            <PlanCard :plan="element"
                                      :others="others(element)"
                                      :menu="menu(element)"
                                      :busy="busy[element.id] ?? false"
                                      :index="index + 1"
                                      draggable>
                                <UButton size="xs"
                                         color="neutral"
                                         variant="subtle"
                                         icon="i-heroicons-play-20-solid"
                                         :loading="busy[element.id] ?? false"
                                         @click="move(element, 'watching')">
                                    Начинаем
                                </UButton>
                            </PlanCard>
                        </template>
                    </draggable>

                    <template v-else-if="column.key === 'watching'">
                        <PlanCard v-for="plan in watching"
                                  :key="plan.id"
                                  :plan="plan"
                                  :others="others(plan)"
                                  :menu="menu(plan)"
                                  :busy="busy[plan.id] ?? false"
                                  :meta="watchingLabel(plan)">
                            <UButton size="xs"
                                     icon="i-heroicons-check-20-solid"
                                     class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                                     :loading="busy[plan.id] ?? false"
                                     @click="move(plan, 'watched')">
                                Досмотрели
                            </UButton>
                        </PlanCard>
                    </template>

                    <template v-else>
                        <PlanCard v-for="plan in watched"
                                  :key="plan.id"
                                  :plan="plan"
                                  :others="others(plan)"
                                  :menu="menu(plan)"
                                  :busy="busy[plan.id] ?? false"
                                  :meta="watchedLabel(plan)"
                                  muted>
                            <UButton size="xs"
                                     color="neutral"
                                     variant="ghost"
                                     icon="i-heroicons-arrow-path-20-solid"
                                     :loading="busy[plan.id] ?? false"
                                     @click="move(plan, 'watching')">
                                Снова смотрим
                            </UButton>
                        </PlanCard>
                    </template>

                    <p v-if="column.count === 0" class="text-sm text-neutral-500 dark:text-neutral-400 px-1 py-3 text-center">
                        <template v-if="column.key === 'planned'">Пусто. Добавьте, что будете смотреть.</template>
                        <template v-else-if="column.key === 'watching'">Сейчас ничего не смотрите.</template>
                        <template v-else>Здесь появится досмотренное.</template>
                    </p>
                </section>
            </div>
        </div>
    </UiManagementMain>

    <PlanModal v-model:open="modalOpen"
               :plan="editing"
               :default-friend-id="friendId"
               @saved="refresh()"/>
</template>
