<script setup lang="ts">
import FeedbackRepository from "~/repos/FeedbackRepository";
import type FeedbackResource from "~/resources/FeedbackResource";

const props = defineProps<{
    filmId: number,
    items: FeedbackResource[],
    refresh: () => Promise<void>
}>();

const {state: profile} = useProfile();

const feedbackRepo              = new FeedbackRepository(props.filmId);

const add        = ref<boolean>(false);
const text       = ref<string>('');
const reaction   = ref<number>(0);
const publishing = ref<boolean>(false);
const toast      = useToast();
const updateId   = ref<number>();

async function publish() {
    publishing.value = true;

    try {
        if (updateId.value)
            await feedbackRepo.update({id: updateId.value, text: text.value, reaction: reaction.value});
        else
            await feedbackRepo.store({text: text.value, reaction: reaction.value});

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
    add.value      = true;
}

watch(add, value => {
    if (!value) {
        text.value     = '';
        reaction.value = 0;
    }
});
</script>

<template>
    <div class="flex flex-col gap-2.5">
        <h1 class="font-bold text-2xl font-roboto leading-5">Отзывы</h1>

        <div v-if="profile" class="sticky top-20 bg-white dark:bg-neutral-900 z-10 pb-2.5">
            <template v-if="add">
                <UTextarea placeholder="Опишите свои эмоции, чувства или какую-нибудь запоминающуюся фразу из фильма..."
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
                     :disabled="!!items.find(item => item.user?.id == profile?.id)"
                     @click="updateId = undefined; add = true"/>
        </div>

        <div v-else>
            <UButton label="Оставить отзыв"
                     color="neutral"
                     variant="subtle"
                     icon="i-heroicons-pencil-square-solid"
                     @click="backAfterLogin()"/>
        </div>

        <div v-if="items"
             class="flex flex-col gap-2.5">
            <UTooltip v-for="item in items"
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