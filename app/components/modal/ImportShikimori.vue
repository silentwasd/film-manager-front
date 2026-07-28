<script setup lang="ts">
import FilmRepository from "~/repos/FilmRepository";
import type Film from "~/resources/Film";

const shown = defineModel<boolean>({default: () => false});

const emit = defineEmits<{ imported: [film: Film] }>();

const repo = new FilmRepository();

const input      = ref<string>('');
const withPeople = ref<boolean>(true);
const withSeyu   = ref<boolean>(true);

const importing = ref<boolean>(false);
const error     = ref<string>();
const log       = ref<string[]>([]);
const imported  = ref<Film>();

/**
 * Принимаем и голый ID, и ссылку на страницу тайтла: у Шикимори канонический
 * адрес выглядит как /animes/z39790-adachi-to-shimamura, буква перед числом
 * есть не всегда, поэтому просто вытаскиваем первое число после /animes/.
 */
const shikimoriId = computed<number | undefined>(() => {
    const value = input.value.trim();

    if (/^\d+$/.test(value))
        return parseInt(value);

    const matched = value.match(/animes\/[a-z]?(\d+)/i);

    return matched ? parseInt(matched[1]!) : undefined;
});

watch(shown, value => {
    if (value)
        return;

    input.value    = '';
    error.value    = undefined;
    log.value      = [];
    imported.value = undefined;
});

async function submit() {
    if (!shikimoriId.value || importing.value)
        return;

    error.value    = undefined;
    log.value      = [];
    imported.value = undefined;

    try {
        importing.value = true;

        const response = await repo.importFromShikimori({
            shikimori_id: shikimoriId.value,
            with_people : withPeople.value,
            with_seyu   : withPeople.value && withSeyu.value
        });

        log.value      = response.log ?? [];
        imported.value = response.data;

        // Не уводим в редактор сразу: в логе видно, что импортёр пропустил и
        // какие жанры завёл, а после навигации это уже не прочитать.
        emit('imported', response.data);
    } catch (err: any) {
        error.value = err?.data?.message ?? 'Не удалось импортировать. Проверьте ID и доступность Шикимори.';
    } finally {
        importing.value = false;
    }
}

async function openCard() {
    if (!imported.value)
        return;

    const id = imported.value.id;

    shown.value = false;

    await navigateTo(`/catalog/films/${id}/edit`);
}
</script>

<template>
    <UModal v-model:open="shown" :dismissible="!importing">
        <template #content>
            <div class="flex flex-row items-center p-5 border-b dark:border-b-neutral-700">
                <h3 class="font-semibold text-lg basis-full">Импорт с Шикимори</h3>

                <UButton icon="i-heroicons-x-mark" color="neutral" variant="link"
                         square size="xl" :disabled="importing" @click="shown = false"/>
            </div>

            <div class="flex flex-col gap-4 p-5">
                <UFormField label="ID аниме или ссылка на Шикимори"
                            :error="error"
                            help="Например 39790 или https://shikimori.one/animes/z39790-adachi-to-shimamura">
                    <UInput v-model="input"
                            placeholder="39790"
                            :disabled="importing"
                            class="w-full"
                            @keydown.enter="submit"/>
                </UFormField>

                <div class="flex flex-col gap-2">
                    <UCheckbox v-model="withPeople"
                               :disabled="importing"
                               label="Тянуть персонал"
                               description="Режиссёр, сценарий, продюсеры, музыка, дизайн персонажей"/>

                    <UCheckbox v-model="withSeyu"
                               :disabled="importing || !withPeople"
                               label="Тянуть озвучку"
                               description="Сэйю главных и второстепенных ролей. Заметно дольше: у каждого персонажа отдельный запрос"/>
                </div>

                <UAlert v-if="importing"
                        icon="i-heroicons-arrow-path"
                        color="neutral"
                        variant="subtle"
                        title="Импортируем"
                        description="Занимает до полуминуты — бэкенд ходит в Шикимори и качает картинки. Не закрывайте окно."/>

                <UAlert v-if="log.length"
                        icon="i-heroicons-check-circle"
                        color="success"
                        variant="subtle"
                        title="Готово">
                    <template #description>
                        <ul class="list-disc list-inside">
                            <li v-for="line in log" :key="line">{{ line }}</li>
                        </ul>
                    </template>
                </UAlert>
            </div>

            <div class="flex items-center justify-end gap-2.5 p-5 border-t dark:border-t-neutral-700">
                <UButton v-if="imported"
                         icon="i-heroicons-pencil-square"
                         class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                         @click="openCard">
                    Открыть карточку
                </UButton>

                <UButton v-else
                         :loading="importing"
                         :disabled="!shikimoriId"
                         class="dark:bg-fuchsia-300 dark:hover:bg-fuchsia-200"
                         @click="submit">
                    Импортировать
                </UButton>

                <UButton color="neutral"
                         :disabled="importing"
                         @click="shown = false">
                    Закрыть
                </UButton>
            </div>
        </template>
    </UModal>
</template>
