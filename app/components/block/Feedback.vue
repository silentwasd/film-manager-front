<script setup lang="ts">
import FeedbackRepository from "~/repos/FeedbackRepository";
import type FeedbackResource from "~/resources/FeedbackResource";

const props = defineProps<{
    filmId: number,
    /** Число сезонов у сериала; 0 — сезонов нет (фильм или не указано). */
    seasons?: number,
    items: FeedbackResource[],
    refresh: () => Promise<void>
}>();

const {state: profile} = useProfile();

const feedbackRepo = new FeedbackRepository(props.filmId);

const add        = ref<boolean>(false);
const text       = ref<string>('');
const reaction   = ref<number>(0);
const publishing = ref<boolean>(false);
const toast      = useToast();
const updateId   = ref<number>();

/**
 * Цель отзыва: 0 — тайтл целиком, N — N-й сезон. Ноль вместо null, потому что
 * USelect не умеет пустое значение; в API уходит null.
 */
const target = ref<number>(0);

/**
 * Фильтр списка: 'all' — все отзывы, иначе цель, как у target.
 */
const filter = ref<'all' | number>('all');

/**
 * Сезоны, доступные для отзывов и фильтра. Сюда же попадают сезоны из уже
 * оставленных отзывов — на случай, если число сезонов потом уменьшили.
 */
const seasonList = computed<number[]>(() => {
    const max = Math.max(props.seasons ?? 0, ...props.items.map(item => item.season ?? 0));

    return Array.from({length: max}, (_, i) => i + 1);
});

const hasSeasons = computed<boolean>(() => seasonList.value.length > 0);

const countOf = (value: number) => props.items.filter(item => (item.season ?? 0) == value).length;

const filterItems = computed(() => [
    {value: 'all' as const, label: 'Все', count: props.items.length},
    {value: 0, label: seasonLabel(null), count: countOf(0)},
    ...seasonList.value.map(season => ({value: season, label: seasonLabel(season), count: countOf(season)}))
]);

const visibleItems = computed<FeedbackResource[]>(() => filter.value === 'all'
    ? props.items
    : props.items.filter(item => (item.season ?? 0) == filter.value));

/** Цели, на которые у пользователя уже есть отзыв. */
const myTargets = computed<Set<number>>(() => new Set(
    props.items
         .filter(item => item.user?.id == profile.value?.id)
         .map(item => item.season ?? 0)
));

/** Цель занята другим отзывом пользователя (свой редактируемый не в счёт). */
function isTaken(value: number): boolean {
    const editing = props.items.find(item => item.id == updateId.value);

    if (editing && (editing.season ?? 0) == value)
        return false;

    return myTargets.value.has(value);
}

const targetItems = computed(() => [0, ...(props.seasons ? seasonList.value.filter(s => s <= props.seasons!) : [])]
    .map(value => ({
        value,
        label   : seasonLabel(value || null) + (isTaken(value) ? ' — отзыв уже есть' : ''),
        disabled: isTaken(value)
    })));

const freeTargets = computed<number[]>(() => targetItems.value.filter(item => !myTargets.value.has(item.value)).map(item => item.value));

/** Писать больше некуда: отзыв есть и на сериал, и на каждый сезон. */
const allTaken = computed<boolean>(() => freeTargets.value.length == 0);

function startNew() {
    updateId.value = undefined;

    // Открыт фильтр по конкретному сезону — пишем про него, иначе про сериал
    // целиком, а если он уже оценён — про первый свободный сезон.
    const preferred = filter.value === 'all' ? 0 : filter.value;
    target.value    = freeTargets.value.includes(preferred) ? preferred : freeTargets.value[0]!;

    add.value = true;
}

async function publish() {
    publishing.value = true;

    const season = hasSeasons.value ? (target.value || null) : undefined;

    try {
        if (updateId.value)
            await feedbackRepo.update({id: updateId.value, text: text.value, reaction: reaction.value, season});
        else
            await feedbackRepo.store({text: text.value, reaction: reaction.value, season});

        add.value = false;
        await props.refresh();
    } catch (e: any) {
        toast.add({
            title      : 'Ошибка',
            description: e.data?.message || e.message,
            color      : 'error'
        });
    } finally {
        publishing.value = false;
    }
}

function update(item: FeedbackResource) {
    text.value     = item.text ?? '';
    reaction.value = item.reaction;
    updateId.value = item.id;
    target.value   = item.season ?? 0;
    add.value      = true;
}

watch(add, value => {
    if (!value) {
        text.value     = '';
        reaction.value = 0;
        updateId.value = undefined;
    }
});

const placeholder = computed<string>(() => target.value
    ? `Как вам ${target.value} сезон? Эмоции, впечатления, запомнившаяся фраза...`
    : 'Опишите свои эмоции, чувства или какую-нибудь запоминающуюся фразу из фильма...');
</script>

<template>
    <div class="flex flex-col gap-2.5">
        <h1 class="font-bold text-2xl font-roboto leading-5">Отзывы</h1>

        <div v-if="hasSeasons" class="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
            <UButton v-for="item in filterItems"
                     :key="String(item.value)"
                     size="sm"
                     :color="filter === item.value ? 'primary' : 'neutral'"
                     :variant="filter === item.value ? 'soft' : 'ghost'"
                     class="shrink-0"
                     @click="filter = item.value">
                {{ item.label }}
                <span class="text-muted ms-0.5">{{ item.count }}</span>
            </UButton>
        </div>

        <div v-if="profile" class="sticky top-20 bg-white dark:bg-neutral-900 z-10 pb-2.5">
            <template v-if="add">
                <USelect v-if="hasSeasons"
                         v-model="target"
                         :items="targetItems"
                         class="w-full sm:w-64 mb-2.5"
                         icon="i-heroicons-tv-16-solid"/>

                <UTextarea :placeholder="placeholder"
                           :rows="5"
                           class="w-full"
                           v-model="text"/>

                <div class="flex justify-between mt-2.5">
                    <div class="flex gap-2.5">
                        <UButton label="Опубликовать"
                                 color="neutral"
                                 variant="subtle"
                                 icon="i-heroicons-paper-airplane-16-solid"
                                 :loading="publishing"
                                 :disabled="text.length > 512"
                                 @click="publish"/>

                        <UTooltip text="Закрыть">
                            <UButton color="neutral"
                                     variant="subtle"
                                     icon="i-heroicons-x-mark-16-solid"
                                     @click="add = false"/>
                        </UTooltip>

                        <UTooltip text="Понравилось">
                            <UButton color="success"
                                     :variant="reaction == 1 ? 'soft' : 'solid'"
                                     icon="i-heroicons-hand-thumb-up-16-solid"
                                     @click="reaction = 1"/>
                        </UTooltip>

                        <UTooltip text="Трудно сказать">
                            <UButton color="secondary"
                                     :variant="reaction == 0 ? 'soft' : 'solid'"
                                     icon="i-heroicons-slash-16-solid"
                                     @click="reaction = 0"/>
                        </UTooltip>

                        <UTooltip text="Не понравилось">
                            <UButton color="error"
                                     :variant="reaction == -1 ? 'soft' : 'solid'"
                                     icon="i-heroicons-hand-thumb-down-16-solid"
                                     @click="reaction = -1"/>
                        </UTooltip>
                    </div>

                    <p class="font-medium font-roboto text-sm text-green-400 text-end"
                       :class="{'text-error-400!': text.length > 512}">
                        {{ text.length }} / 512
                    </p>
                </div>
            </template>

            <UButton v-else
                     label="Оставить отзыв"
                     color="neutral"
                     variant="subtle"
                     icon="i-heroicons-pencil-square-solid"
                     :disabled="allTaken"
                     @click="startNew"/>
        </div>

        <div v-else>
            <UButton label="Оставить отзыв"
                     color="neutral"
                     variant="subtle"
                     icon="i-heroicons-pencil-square-solid"
                     @click="backAfterLogin()"/>
        </div>

        <p v-if="hasSeasons && filter !== 'all' && visibleItems.length == 0"
           class="font-roboto text-neutral-500">
            {{ filter ? `Отзывов на ${filter} сезон пока нет.` : 'Отзывов на весь сериал пока нет.' }}
        </p>

        <div v-if="visibleItems.length"
             class="flex flex-col gap-2.5">
            <UTooltip v-for="item in visibleItems"
                      :key="item.id"
                      class="block"
                      :class="{'cursor-pointer': profile?.id == item.user?.id}"
                      :text="profile?.id == item.user?.id ? 'Кликните, чтобы изменить' : ''"
                      @click="profile?.id == item.user?.id ? update(item) : null">
                <div
                    class="flex items-start gap-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-md p-2.5 pb-2 border dark:border-0"
                    :class="{'bg-error-200! dark:bg-error-500/40! border-error-400': item.reaction == -1, 'bg-green-100! dark:bg-green-400/20! border-green-400': item.reaction == 1}">
                    <UAvatar :alt="item.user?.name"
                             size="md"
                             class="border dark:border-0"/>

                    <div>
                        <h3 class="font-roboto">
                            <span class="font-medium">{{ item.user?.name }}</span>
                            <UBadge v-if="hasSeasons"
                                    :label="seasonLabel(item.season)"
                                    :color="item.season ? 'primary' : 'neutral'"
                                    variant="subtle"
                                    size="sm"
                                    class="ms-1.5 align-text-bottom"/>
                            <span class="text-sm text-neutral-600 dark:text-neutral-400 ms-1.5">
                                <NuxtTime :datetime="item.created_at"/>
                                <template v-if="item.updated_at != item.created_at">
                                    (изменено)
                                </template>
                            </span>
                        </h3>

                        <p v-if="item.text" class="font-roboto">{{ item.text }}</p>

                        <div v-else>
                            <UIcon v-if="item.reaction == 1"
                                   name="i-heroicons-hand-thumb-up-16-solid"
                                   class="text-2xl text-green-400"/>

                            <UIcon v-else
                                   name="i-heroicons-hand-thumb-down-16-solid"
                                   class="text-2xl text-error-400"/>
                        </div>
                    </div>
                </div>
            </UTooltip>
        </div>
    </div>
</template>

<style scoped>

</style>
