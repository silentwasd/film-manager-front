<script setup lang="ts">
import RatingRepository from "~/repos/RatingRepository";
import type Film from "~/resources/Film";
import type Rating from "~/resources/Rating";

const emit = defineEmits<{
    (e: 'updated'): void
}>();

const film = defineModel<Film>();

const ratings = ref<Rating[]>([]);

watch(film, async (value) => {
    if (!value)
        return;

    const repo = new RatingRepository(value.id);
    ratings.value = (await repo.fetchList()).data ?? [];
});

async function refresh() {
    if (!film.value)
        return;

    const repo = new RatingRepository(film.value.id);
    ratings.value = (await repo.fetchList()).data ?? [];
}

function makeRating(): Rating {
    return {
        id  : 0,
        data: {
            comment: ''
        }
    };
}

async function save(data: Rating) {
    if (!film.value)
        return;

    const repo = new RatingRepository(film.value.id);

    if (data.id === 0)
        await repo.store(data);
    else
        await repo.update(data);

    await refresh();

    emit('updated');
}

async function remove(data: Rating) {
    if (!film.value)
        return;

    if (data.id == 0) {
        ratings.value = ratings.value.filter(_rating => data != _rating);
        return;
    }

    const repo = new RatingRepository(film.value.id);
    await repo.remove(data.id);
    await refresh();

    emit('updated');
}
</script>

<template>
    <UModal :model-value="!!film" @update:model-value="value => !value ? (film = undefined) : ''">
        <UCard :ui="{ring: ''}">
            <template #header>
                <div class="flex flex-row">
                    <h3 class="font-semibold text-lg basis-full">Рейтинги</h3>

                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="link"
                             square size="xl" :padded="false" @click="film = undefined"/>
                </div>
            </template>

            <UButton color="neutral"
                     icon="i-heroicons-plus"
                     @click="ratings.unshift(makeRating())">
                Добавить
            </UButton>

            <div class="flex flex-col gap-5 mt-5">
                <UCard v-for="rating in ratings"
                       :key="rating.id"
                       :ui="{header: {padding: 'sm:px-3 sm:py-2.5'}, body: {padding: 'sm:px-3 sm:py-3'}, footer: {padding: 'sm:px-3 sm:py-2.5'}}">
                    <template #header>
                        <h5 class="text-sm font-semibold">{{ rating.id > 0 ? `Рейтинг #${rating.id}` : 'Новый рейтинг' }}</h5>
                    </template>

                    <div class="flex flex-col gap-2.5">
                        <UFormField label="Комментарий">
                            <UInput v-model="rating.data.comment"/>
                        </UFormField>
                    </div>

                    <template #footer>
                        <div class="flex items-center justify-end gap-2.5">
                            <UButton icon="i-heroicons-check"
                                     size="xs"
                                     @click="save(rating)">
                                Сохранить
                            </UButton>

                            <UButton color="error"
                                     icon="i-heroicons-trash"
                                     size="xs"
                                     @click="remove(rating)">
                                Удалить
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </div>
        </UCard>
    </UModal>
</template>

<style scoped>

</style>