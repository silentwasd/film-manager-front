<script setup lang="ts">
import {FilmFormat} from "~/types/enums/FilmFormat";
import GenreRepository from "~/repos/management/GenreRepository";
import CountryRepository from "~/repos/management/CountryRepository";
import TagRepository from "~/repos/management/TagRepository";
import CompanyRepository from "~/repos/management/CompanyRepository";
import type GenreResource from "~/resources/management/GenreResource";
import type CountryResource from "~/resources/management/CountryResource";
import type TagResource from "~/resources/management/TagResource";
import type CompanyResource from "~/resources/management/CompanyResource";
import type Film from "~/resources/Film";
import FilmRepository from "~/repos/FilmRepository";

const props = defineProps<{
    film: Film,
    refresh: () => Promise<void>
}>();

const filmRepo = new FilmRepository();
const form     = ref();
const saving   = defineModel<boolean>('saving');
const state    = ref({...props.film});
const save     = defineModel<() => Promise<void>>('save');
const toast    = useToast();
const fileRef  = ref();

const cover = computed(() => {
    if (!(state.value.cover instanceof File))
        return state.value.cover ? fileUrl(state.value.cover as string) : undefined;

    return URL.createObjectURL(state.value.cover);
});

save.value = async () => {
    if (!state.value)
        return;

    form.value.clear();
    saving.value = true;

    try {
        await filmRepo.update({
            ...state.value,
            genres          : state.value.genres?.map(genre => (genre as GenreResource).id),
            countries       : state.value.countries?.map(country => (country as CountryResource).id),
            tags            : state.value.tags?.map(tag => (tag as TagResource).id),
            companies       : state.value.companies?.map(company => (company as CompanyResource).id),
            cover           : state.value.cover instanceof File ? state.value.cover : undefined,
            background_cover: state.value.background_cover instanceof File ? state.value.background_cover : undefined
        });

        await props.refresh();

        toast.add({
            title      : 'Успех',
            description: 'Фильм успешно сохранен.',
            color      : 'success'
        });
    } catch (err: any) {
        if (err.statusCode === 422) {
            form.value.setErrors(Object.keys(err.data.errors).map((key: string) => ({
                message: err.data.errors[key].join('. '),
                path   : key
            })));

            return;
        }

        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err?.message,
            color      : 'error'
        });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="flex gap-5 py-5">
        <div class="sticky top-48 h-full">
            <div
                class="relative flex items-center justify-center w-[250px] h-[375px] border border-neutral-700 rounded-lg overflow-clip bg-cover bg-center cursor-pointer"
                :style="`background-image: url(${fileUrl(state.cover as string)});`"
                @click="fileRef.click()">
                <input ref="fileRef"
                       type="file"
                       class="hidden"
                       accept="image/*"
                       @input="state.cover = $event.target.files[0] ?? film.cover"/>

                <div class="absolute w-full h-full backdrop-blur"></div>

                <img v-if="state.cover"
                     :src="cover"
                     :alt="state.name"
                     class="max-w-62.5 max-h-93.75 z-10"/>

                <UIcon v-else name="i-heroicons-film" class="text-8xl"/>
            </div>

            <UButton
                color="neutral"
                label="Просмотр"
                icon="i-heroicons-eye-solid"
                class="w-full mt-2.5"
                :to="`/catalog/films/${film.id}`"/>
        </div>

        <UForm ref="form"
               :state="state"
               class="flex flex-col gap-2.5 grow"
               @submit="() => save ? save() : undefined">
            <input type="submit" class="hidden"/>

            <UFormField label="Наименование" name="name" required>
                <UInput v-model="state.name"
                        class="w-full"/>
            </UFormField>

            <UFormField label="Оригинальное наименование" name="original_name">
                <UInput :model-value="state.original_name ?? ''"
                        @update:model-value="state.original_name = $event"
                        placeholder="The Jack Who Built The House"
                        class="w-full"/>
            </UFormField>

            <UFormField label="Фоновая обложка" name="background_cover">
                <UInput type="file"
                        accept="image/*"
                        class="w-full"
                        @input="state.background_cover = $event.target.files[0]"/>
            </UFormField>

            <UFormField label="Формат" name="format" required>
                <USelectMenu v-model="state.format"
                             class="w-full"
                             :items="Object.values(FilmFormat)">
                    <template #item-label="{item}">
                        {{ filmFormat(item) }}
                    </template>

                    <template #default>
                        {{ filmFormat(state.format) }}
                    </template>
                </USelectMenu>
            </UFormField>

            <UFormField label="Год производства" name="produced_year">
                <UInput type="number"
                        class="w-full"
                        :min="0"
                        v-model="state.produced_year"/>
            </UFormField>

            <UFormField label="Дата премьеры" name="release_date">
                <UInput type="date"
                        class="w-full"
                        :model-value="state.release_date ? undater(state.release_date) : undefined"
                        @update:model-value="state.release_date = dater($event)"/>

                <template v-if="state.release_date" #hint>
                    <NuxtTime :datetime="undater(state.release_date)" date-style="medium"/>
                </template>
            </UFormField>

            <UFormField label="Жанры" name="genres">
                <UiRepoSearchSelect :repo="new GenreRepository()"
                                    class="w-full"
                                    placeholder="Выберите жанры из списка"
                                    multiple
                                    v-model="state.genres">
                    <template v-if="(state.genres ?? []).length > 0" #label>
                        {{
                            (state.genres ?? []).map(genre => (genre as GenreResource).name).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelect>
            </UFormField>

            <UFormField label="Страны" name="countries">
                <UiRepoSearchSelect :repo="new CountryRepository()"
                                    class="w-full"
                                    placeholder="Выберите страны из списка"
                                    multiple
                                    v-model="state.countries">
                    <template v-if="(state.countries ?? []).length > 0" #label>
                        {{
                            (state.countries ?? []).map(country => (country as CountryResource).name).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelect>
            </UFormField>

            <UFormField label="Теги" name="tags">
                <UiRepoSearchSelect :repo="new TagRepository()"
                                    class="w-full"
                                    placeholder="Выберите теги из списка"
                                    multiple
                                    v-model="state.tags">
                    <template v-if="(state.tags ?? []).length > 0" #label>
                        {{
                            (state.tags ?? []).map(tag => (tag as TagResource).name).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelect>
            </UFormField>

            <UFormField label="Компании" name="companies">
                <UiRepoSearchSelect :repo="new CompanyRepository()"
                                    class="w-full"
                                    placeholder="Выберите компании из списка"
                                    multiple
                                    v-model="state.companies">
                    <template v-if="(state.companies ?? []).length > 0" #label>
                        {{
                            (state.companies ?? []).map(company => (company as CompanyResource).name).join(', ')
                        }}
                    </template>
                </UiRepoSearchSelect>
            </UFormField>

            <UFormField :label="'Описание (' + (state.description?.length ?? 0) + ' / 65535)'"
                        name="description">
                <UTextarea
                    :model-value="state.description ? state.description.replaceAll('\r', '') : undefined"
                    @update:model-value="state.description = $event"
                    :rows="10"
                    class="w-full"/>
            </UFormField>
        </UForm>
    </div>
</template>

<style scoped>

</style>