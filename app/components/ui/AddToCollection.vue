<script setup lang="ts">
import CollectionRepository from "~/repos/CollectionRepository";
import type Collection from "~/resources/Collection";
import type PaginatedCollection from "~/types/PaginatedCollection";

const props = defineProps<{
    filmId: number,
    iconOnly?: boolean
}>();

const repo  = new CollectionRepository();
const toast = useToast();

const open       = ref(false);
const loading    = ref(false);
const saving     = ref(false);
const collections = ref<Collection[]>([]);
const selectedId  = ref<number | undefined>();
const note        = ref<string>('');
const newName     = ref<string>('');
const creating    = ref(false);

async function loadCollections() {
    loading.value = true;

    try {
        const data      = await repo.fetchList<PaginatedCollection<Collection>>({per_page: 100});
        collections.value = data.data;
    } finally {
        loading.value = false;
    }
}

async function openModal() {
    open.value      = true;
    selectedId.value = undefined;
    note.value       = '';
    newName.value    = '';
    creating.value   = false;

    await loadCollections();
}

async function createAndSelect() {
    if (!newName.value.trim()) {
        return;
    }

    saving.value = true;

    try {
        const result = await repo.store({name: newName.value.trim()});
        collections.value.push(result.data as any);
        selectedId.value = (result.data as any).id;
        newName.value    = '';
        creating.value   = false;
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

async function addToCollection() {
    if (!selectedId.value) {
        return;
    }

    saving.value = true;

    try {
        await repo.addFilm(selectedId.value, props.filmId, note.value || null);
        open.value = false;

        toast.add({title: 'Фильм добавлен в коллекцию'});
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
    <UButton v-if="!iconOnly"
             color="neutral"
             variant="subtle"
             label="В коллекцию"
             icon="i-heroicons-rectangle-stack"
             class="w-full"
             @click="openModal"/>

    <UButton v-else
             color="neutral"
             variant="subtle"
             icon="i-heroicons-rectangle-stack"
             square
             @click="openModal"/>

    <UModal v-model:open="open" :dismissible="!saving">
        <template #content>
            <div class="flex flex-row items-center p-5 border-b dark:border-b-gray-700">
                <h3 class="font-semibold text-lg basis-full">Добавить в коллекцию</h3>

                <UButton icon="i-heroicons-x-mark"
                         color="neutral"
                         variant="link"
                         square
                         size="xl"
                         :disabled="saving"
                         @click="open = false"/>
            </div>

            <div class="flex flex-col gap-3 p-5">
                <div v-if="loading" class="flex flex-col gap-2">
                    <USkeleton v-for="i in 3" :key="i" class="h-10 w-full"/>
                </div>

                <template v-else>
                    <div v-if="collections.length > 0" class="flex flex-col gap-1 max-h-52 overflow-auto">
                        <label v-for="col in collections"
                               :key="col.id"
                               class="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                               :class="selectedId === col.id ? 'bg-neutral-100 dark:bg-neutral-800' : ''">
                            <input type="radio"
                                   :value="col.id"
                                   v-model="selectedId"
                                   class="accent-fuchsia-400"/>

                            <span class="grow font-medium text-sm">{{ col.name }}</span>

                            <span class="text-xs text-neutral-400">
                                {{ col.films_count ?? 0 }} фил.
                            </span>
                        </label>
                    </div>

                    <p v-else class="text-sm text-neutral-400 italic">У вас пока нет коллекций.</p>

                    <div v-if="creating" class="flex items-center gap-2 mt-1">
                        <UInput v-model="newName"
                                placeholder="Название новой коллекции"
                                class="grow"
                                :maxlength="255"
                                @keydown.enter="createAndSelect"/>

                        <UButton size="sm"
                                 :loading="saving"
                                 :disabled="!newName.trim()"
                                 class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                                 @click="createAndSelect">
                            Создать
                        </UButton>

                        <UButton size="sm" color="neutral" variant="ghost" @click="creating = false">
                            Отмена
                        </UButton>
                    </div>

                    <UButton v-else
                             size="sm"
                             color="neutral"
                             variant="ghost"
                             icon="i-heroicons-plus"
                             class="self-start"
                             @click="creating = true">
                        Новая коллекция
                    </UButton>

                    <UFormField label="Заметка (необязательно)" class="mt-1">
                        <UTextarea v-model="note"
                                   placeholder="Ваша заметка к этому фильму..."
                                   class="w-full"
                                   autoresize
                                   :rows="2"
                                   :maxrows="5"
                                   :maxlength="512"/>
                    </UFormField>
                </template>
            </div>

            <div class="flex items-center justify-end gap-2.5 p-5 border-t dark:border-t-gray-700">
                <UButton :loading="saving"
                         :disabled="!selectedId"
                         class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                         @click="addToCollection">
                    Добавить
                </UButton>

                <UButton color="neutral"
                         :disabled="saving"
                         @click="open = false">
                    Отменить
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<style scoped>
</style>
