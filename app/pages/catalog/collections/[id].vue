<script setup lang="ts">
// @ts-ignore
import draggable from 'vuedraggable';
import CollectionRepository from "~/repos/CollectionRepository";
import FilmRepository from "~/repos/FilmRepository";
import type Collection from "~/resources/Collection";
import type CollectionFilm from "~/resources/CollectionFilm";
import type Film from "~/resources/Film";
import type Resource from "~/types/Resource";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const route = useRoute();
const toast = useToast();
const id    = parseInt(route.params.id as string);
const repo  = new CollectionRepository();

const {data: collectionData} = await repo.show<Resource<Collection>>(`collection.${id}`, id);
const collection              = computed<Collection | null>(() => collectionData.value?.data ?? null);

useSeoMeta({title: () => `${collection.value?.name ?? 'Коллекция'} // ВКинопоиск`});

const serverFilms = ref<CollectionFilm[]>(collection.value?.films ?? []);
const localFilms  = ref<CollectionFilm[]>([...(collection.value?.films ?? [])]);

const isDirty = computed<boolean>(() =>
    localFilms.value.map(f => f.id).join(',') !== serverFilms.value.map(f => f.id).join(',')
);

// --- Добавление фильма ---
// addFilmPosition: null = в конец; число = конкретная 1-based позиция
const filmRepo        = new FilmRepository();
const addFilmOpen     = ref(false);
const addFilmObject   = ref<Film | undefined>();
const addFilmNote     = ref<string>('');
const addFilmPosition = ref<number | null>(null);
const addFilmSaving   = ref(false);

function openAddFilm(position: number | null = null) {
    addFilmObject.value   = undefined;
    addFilmNote.value     = '';
    addFilmPosition.value = position;
    addFilmOpen.value     = true;
}

async function confirmAddFilm() {
    if (!addFilmObject.value?.id) {
        return;
    }

    addFilmSaving.value = true;

    try {
        const result   = await repo.addFilm(id, addFilmObject.value.id, addFilmNote.value || null, addFilmPosition.value);
        const newEntry: CollectionFilm = result.data;

        const insertIndex = addFilmPosition.value === null
            ? localFilms.value.length
            : addFilmPosition.value - 1;

        const insertInto = (list: CollectionFilm[]) => {
            const copy = [...list];
            copy.splice(insertIndex, 0, newEntry);
            return copy;
        };

        serverFilms.value = insertInto(serverFilms.value);
        localFilms.value  = insertInto(localFilms.value);

        addFilmOpen.value = false;

        toast.add({title: 'Фильм добавлен в коллекцию'});
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        addFilmSaving.value = false;
    }
}

// --- Редактирование заметки ---
const editNoteFilm  = ref<CollectionFilm | null>(null);
const editNoteText  = ref<string>('');
const editNoteSaving = ref(false);

function openEditNote(film: CollectionFilm) {
    editNoteFilm.value = film;
    editNoteText.value = film.note ?? '';
}

async function saveNote() {
    if (!editNoteFilm.value) {
        return;
    }

    editNoteSaving.value = true;

    try {
        await repo.updateFilmNote(id, editNoteFilm.value.film_id!, editNoteText.value || null);

        const update = (list: CollectionFilm[]) =>
            list.map(f => f.id === editNoteFilm.value!.id ? {...f, note: editNoteText.value || null} : f);

        serverFilms.value  = update(serverFilms.value);
        localFilms.value   = update(localFilms.value);
        editNoteFilm.value = null;

        toast.add({title: 'Заметка обновлена'});
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        editNoteSaving.value = false;
    }
}

// --- Удаление фильма ---
const removing = ref<{ [key: number]: boolean }>({});

async function removeFilm(film: CollectionFilm) {
    removing.value[film.id] = true;

    try {
        await repo.removeFilm(id, film.film_id!);

        serverFilms.value = serverFilms.value.filter(f => f.id !== film.id);
        localFilms.value  = localFilms.value.filter(f => f.id !== film.id);

        toast.add({title: 'Фильм удалён из коллекции'});
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'error'
        });
    } finally {
        removing.value[film.id] = false;
    }
}

// --- Сохранение порядка ---
const saving = ref(false);

async function saveOrder() {
    saving.value = true;

    try {
        await repo.reorder(id, localFilms.value.map(f => f.film_id!));
        serverFilms.value = localFilms.value.map((f, i) => ({...f, position: i + 1}));

        toast.add({title: 'Порядок сохранён'});
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

function discardOrder() {
    localFilms.value = [...serverFilms.value];
}

// --- Защита от потери порядка ---
useEventListener('beforeunload', (e: BeforeUnloadEvent) => {
    if (isDirty.value) {
        e.preventDefault();
    }
});

onBeforeRouteLeave(() => {
    if (isDirty.value) {
        return window.confirm('Порядок фильмов не сохранён. Вы уверены, что хотите уйти?');
    }
    return true;
});
</script>

<template>
    <UiManagementMain>
        <div class="flex flex-col gap-5 grow h-0 overflow-auto">
            <!-- Шапка -->
            <div class="flex items-center justify-between gap-4 flex-wrap shrink-0">
                <div>
                    <NuxtLink class="text-sm text-neutral-400 hover:underline"
                              to="/catalog/collections">
                        ← Мои коллекции
                    </NuxtLink>
                    <h1 class="text-2xl font-bold mt-0.5">{{ collection?.name }}</h1>
                </div>

                <UButton icon="i-heroicons-plus"
                         color="neutral"
                         variant="subtle"
                         @click="openAddFilm()">
                    Добавить фильм
                </UButton>
            </div>

            <!-- Баннер несохранённых изменений -->
            <div v-if="isDirty"
                 class="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 shrink-0">
                <p class="text-sm font-medium text-amber-500">
                    Порядок фильмов изменён, но не сохранён.
                </p>

                <div class="flex items-center gap-2">
                    <UButton size="sm"
                             :loading="saving"
                             class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                             @click="saveOrder">
                        Сохранить порядок
                    </UButton>

                    <UButton size="sm"
                             color="neutral"
                             variant="subtle"
                             :disabled="saving"
                             @click="discardOrder">
                        Отменить
                    </UButton>
                </div>
            </div>

            <!-- Список фильмов с точками вставки -->
            <div v-if="localFilms.length > 0" class="overflow-auto">
                <!-- Вставить в начало -->
                <div class="group">
                    <button class="w-full opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-fuchsia-400 transition-all py-1.5 rounded hover:bg-fuchsia-500/10"
                            @click="openAddFilm(1)">
                        <UIcon name="i-heroicons-plus-circle" class="w-3.5 h-3.5"/>
                        В начало
                    </button>
                </div>

                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b dark:border-neutral-800 text-left">
                            <th class="w-8 pb-2"></th>
                            <th class="w-10 pb-2 text-neutral-400 font-medium">#</th>
                            <th class="pb-2 text-neutral-400 font-medium">Фильм</th>
                            <th class="pb-2 text-neutral-400 font-medium">Заметка</th>
                            <th class="pb-2"></th>
                        </tr>
                    </thead>

                    <draggable tag="tbody"
                               v-model="localFilms"
                               item-key="id"
                               handle=".drag-handle"
                               ghost-class="opacity-40">
                        <template #item="{element, index}">
                            <tr class="border-b dark:border-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/30 transition-colors">
                                <td class="py-2.5 pr-2">
                                    <UIcon name="i-heroicons-bars-3"
                                           class="drag-handle cursor-grab active:cursor-grabbing text-neutral-400 w-5 h-5"/>
                                </td>

                                <td class="py-2.5 pr-3 text-neutral-400 font-mono text-xs w-10">
                                    {{ index + 1 }}
                                </td>

                                <td class="py-2.5 pr-4 min-w-60">
                                    <NuxtLink class="flex items-center gap-2.5 hover:underline underline-offset-2"
                                              :to="`/catalog/films/${element.film?.id}`">
                                        <div v-if="element.film?.cover"
                                             class="bg-no-repeat bg-cover bg-center rounded w-8 h-8 shrink-0"
                                             :style="`background-image: url(${fileUrl(element.film.cover as string)})`"></div>

                                        <UIcon v-else name="i-heroicons-film" class="w-8 h-8 shrink-0"/>

                                        <div>
                                            <p class="font-semibold leading-4">
                                                {{ (element.film?.name?.length ?? 0) > 40
                                                    ? element.film!.name.slice(0, 40) + '...'
                                                    : element.film?.name }}
                                            </p>

                                            <p v-if="element.film?.people && element.film.people.length > 0"
                                               class="text-xs text-neutral-400">
                                                <UiPeopleShortText :people="element.film.people"/>
                                            </p>
                                        </div>
                                    </NuxtLink>
                                </td>

                                <td class="py-2.5 pr-4 max-w-64">
                                    <p v-if="element.note" class="text-xs text-neutral-400 italic line-clamp-2">
                                        {{ element.note }}
                                    </p>

                                    <p v-else class="text-xs text-neutral-500 italic">нет заметки</p>
                                </td>

                                <td class="py-2.5">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <UTooltip text="Добавить после">
                                            <UButton color="neutral"
                                                     variant="ghost"
                                                     icon="i-heroicons-plus-circle"
                                                     size="xs"
                                                     square
                                                     @click="openAddFilm(index + 2)"/>
                                        </UTooltip>

                                        <UTooltip text="Изменить заметку">
                                            <UButton color="neutral"
                                                     variant="ghost"
                                                     icon="i-heroicons-pencil-solid"
                                                     size="xs"
                                                     square
                                                     @click="openEditNote(element)"/>
                                        </UTooltip>

                                        <UTooltip text="Удалить из коллекции">
                                            <UButton color="neutral"
                                                     variant="ghost"
                                                     icon="i-heroicons-trash-solid"
                                                     size="xs"
                                                     square
                                                     :loading="removing[element.id] ?? false"
                                                     @click="removeFilm(element)"/>
                                        </UTooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </draggable>
                </table>
            </div>

            <div v-else class="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                <UIcon name="i-heroicons-film" class="w-12 h-12"/>
                <p>В коллекции пока нет фильмов</p>
                <UButton variant="subtle" color="neutral" @click="openAddFilm()">
                    Добавить первый фильм
                </UButton>
            </div>
        </div>
    </UiManagementMain>

    <!-- Модалка добавления фильма -->
    <UModal v-model:open="addFilmOpen" :dismissible="!addFilmSaving">
        <template #content>
            <div class="flex flex-row items-center p-5 border-b dark:border-b-neutral-700">
                <h3 class="font-semibold text-lg basis-full">Добавить фильм в коллекцию</h3>

                <UButton icon="i-heroicons-x-mark"
                         color="neutral"
                         variant="link"
                         square
                         size="xl"
                         :disabled="addFilmSaving"
                         @click="addFilmOpen = false"/>
            </div>

            <div class="flex flex-col gap-2.5 p-5">
                <UFormField label="Фильм" required>
                    <UiRepoSearchSelect :repo="filmRepo"
                                        placeholder="Выберите фильм"
                                        class="w-full"
                                        v-model="addFilmObject"/>
                </UFormField>

                <UFormField label="Заметка (необязательно)">
                    <UTextarea v-model="addFilmNote"
                               placeholder="Ваша заметка к этому фильму..."
                               class="w-full"
                               autoresize
                               :rows="2"
                               :maxrows="5"
                               :maxlength="512"/>
                </UFormField>
            </div>

            <div class="flex items-center justify-end gap-2.5 p-5 border-t dark:border-t-neutral-700">
                <UButton :loading="addFilmSaving"
                         :disabled="!addFilmObject"
                         class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                         @click="confirmAddFilm">
                    Добавить
                </UButton>

                <UButton color="neutral"
                         :disabled="addFilmSaving"
                         @click="addFilmOpen = false">
                    Отменить
                </UButton>
            </div>
        </template>
    </UModal>

    <!-- Модалка редактирования заметки -->
    <UModal :open="!!editNoteFilm" :dismissible="!editNoteSaving" @update:open="v => { if (!v) editNoteFilm = null }">
        <template #content>
            <div class="flex flex-row items-center p-5 border-b dark:border-b-neutral-700">
                <h3 class="font-semibold text-lg basis-full">Заметка к фильму</h3>

                <UButton icon="i-heroicons-x-mark"
                         color="neutral"
                         variant="link"
                         square
                         size="xl"
                         :disabled="editNoteSaving"
                         @click="editNoteFilm = null"/>
            </div>

            <div class="flex flex-col gap-2.5 p-5">
                <p class="text-sm font-medium">{{ editNoteFilm?.film?.name }}</p>

                <UFormField label="Заметка">
                    <UTextarea v-model="editNoteText"
                               placeholder="Ваша заметка к этому фильму..."
                               class="w-full"
                               autoresize
                               :rows="3"
                               :maxrows="8"
                               :maxlength="512"/>
                </UFormField>
            </div>

            <div class="flex items-center justify-end gap-2.5 p-5 border-t dark:border-t-neutral-700">
                <UButton :loading="editNoteSaving"
                         class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                         @click="saveNote">
                    Сохранить
                </UButton>

                <UButton color="neutral"
                         :disabled="editNoteSaving"
                         @click="editNoteFilm = null">
                    Отменить
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<style scoped>
</style>
