<script setup lang="ts">
import PersonRepository from "~/repos/PersonRepository";
import type PaginatedCollection from "~/types/PaginatedCollection";
import type PersonResource from "~/resources/PersonResource";
import CountryRepository from "~/repos/management/CountryRepository";
import useMultiQuery from "~/composables/use-multi-query";
import {PersonRole} from "~/types/enums/PersonRole";
import {PersonSex} from "~/types/enums/PersonSex";

definePageMeta({
    middleware: 'auth',
    layout    : 'management'
});

const config = useRuntimeConfig();
const route  = useRoute();

useSeoMeta({
    title        : 'Люди // ВКинопоиск',
    description  : 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogTitle      : 'Люди // ВКинопоиск',
    ogDescription: 'Сохрани каждый момент. Отслеживай просмотр и ставь собственные оценки.',
    ogImage      : config.public.externalUrl + '/img/cinema.png',
    ogUrl        : config.public.externalUrl,
    ogType       : 'website',
    ogLocale     : 'ru_RU',
    ogSiteName   : 'ВКинопоиск'
});

const role      = ref<PersonRole | undefined>(route.query.role ? (route.query.role as PersonRole) : undefined);
const countries = useMultiQuery('countries');

const {name, page, perPage, sort, clearFilters} = useTabler('people', () => ({
    role     : role.value,
    countries: countries.value
}), () => {
    role.value      = undefined;
    countries.value = [];
});

const personRepo                      = new PersonRepository();
const {data: people, status, refresh} = await personRepo.lazyList<PaginatedCollection<PersonResource>>(() => ({
    name          : name.value,
    page          : page.value,
    per_page      : perPage.value,
    countries     : countries.value,
    sort_column   : sort.value.column,
    sort_direction: sort.value.direction,
    ...role.value ? {role: role.value} : {}
}));

const columns = [
    {
        key     : 'id',
        label   : '#',
        sortable: true
    },
    {
        key     : 'name',
        label   : 'Наименование',
        sortable: true
    },
    {
        key     : 'birth_date',
        label   : 'Дата рождения',
        sortable: true
    },
    {
        key     : 'death_date',
        label   : 'Дата смерти',
        sortable: true
    },
    {
        key  : 'country.name',
        label: 'Страна'
    },
    {
        key     : 'films_count',
        label   : 'Фильмы',
        sortable: true
    },
    {
        key  : 'roles',
        label: 'Роли'
    },
    {
        key: 'actions'
    }
];

const editRow  = ref<PersonResource>();
const removing = ref<{ [key: string]: boolean }>({});
const toast    = useToast();

watch(editRow, value => {
    if (!value || !value.id)
        return;

    if (!editRow.value)
        return;

    editRow.value.country_id = value.country?.id ?? null;
});

function makeResource(): PersonResource {
    return {
        id           : 0,
        name         : '',
        original_name: '',
        birth_date   : null,
        death_date   : null,
        sex          : null,
        photo        : null,
        country_id   : null
    };
}

async function remove(person: PersonResource) {
    removing.value[person.id] = true;

    try {
        await personRepo.remove(person.id);
        await refresh();
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err.message,
            color      : 'red'
        });
    } finally {
        removing.value[person.id] = false;
    }
}

async function save(state: any) {
    if (state.id > 0) {
        await personRepo.update({...state, ...state.photo instanceof File ? {photo: state.photo} : {photo: null}});
    } else {
        await personRepo.store(state);
    }

    await refresh();
}
</script>

<template>
    <UiManagementMain>
        <UiSelectTable :columns="columns"
                       :rows="people?.data ?? []"
                       :page-count="people?.meta.per_page"
                       :total="people?.meta.total"
                       :loading="status == 'pending'"
                       class="grow h-0"
                       v-model:page="page"
                       v-model:sort="sort">
            <template #filters>
                <UiTableSearch v-model="name"/>
                <UiTablePerPage v-model="perPage"/>
                <UiTablePersonRole placeholder="Фильтр по роли"
                                   v-model="role"/>
                <UiTableClearFilters @clear="clearFilters"/>
            </template>

            <template #selected>
                <UiRepoSearchSelectId :repo="new CountryRepository()"
                                      placeholder="Фильтр по странам"
                                      multiple
                                      v-model="countries"/>
            </template>

            <template #actions>
                <UButton icon="i-heroicons-plus"
                         color="gray"
                         @click="editRow = makeResource()">
                    Создать
                </UButton>
            </template>

            <template #name-data="{row}">
                <NuxtLink class="flex items-center gap-2.5 hover:underline"
                          :to="`/catalog/people/${row.id}`">
                    <div v-if="row.photo"
                         class="bg-no-repeat bg-cover bg-center rounded w-8 h-8"
                         :style="`background-image: url(${fileUrl(row.photo)})`"></div>

                    <UIcon v-else name="i-heroicons-user-circle" class="w-8 h-8"/>

                    <div>
                        <p class="line-clamp-1 text-wrap font-semibold leading-4"
                           :class="{'text-primary': row.sex == PersonSex.Male, 'text-pink-400': row.sex == PersonSex.Female}">
                            {{ row.name }}
                        </p>

                        <p v-if="row.original_name"
                           class="line-clamp-1 text-wrap text-xs leading-4"
                           :class="{'text-primary-600': row.sex == PersonSex.Male, 'text-pink-600': row.sex == PersonSex.Female}">
                            {{ row.original_name }}
                        </p>
                    </div>
                </NuxtLink>
            </template>

            <template #birth_date-data="{row}">
                <NuxtTime v-if="row.birth_date" :datetime="row.birth_date" date-style="medium"/>
                <p v-else class="italic">Не указана</p>
            </template>

            <template #death_date-data="{row}">
                <NuxtTime v-if="row.death_date" :datetime="row.death_date" date-style="medium"/>
                <p v-else class="italic">Не указана</p>
            </template>

            <template #roles-data="{row}">
                <p class="line-clamp-2 text-wrap leading-4 max-w-[200px]">
                    {{ row.roles.map((role: PersonRole, index: number) => index > 0 ? personRole(role).toLowerCase() : personRole(role)).join(', ') }}
                </p>
            </template>

            <template #actions-data="{row}">
                <div v-if="row.can_edit" class="flex items-center justify-end gap-2.5">
                    <template v-if="!row.sex">
                        <UButton color="blue"
                                 icon="i-material-symbols-male"
                                 square
                                 @click="personRepo.update({...row, photo: null, sex: PersonSex.Male}).then(() => refresh())"/>

                        <UButton color="pink"
                                 icon="i-material-symbols-female"
                                 square
                                 @click="personRepo.update({...row, photo: null, sex: PersonSex.Female}).then(() => refresh())"/>
                    </template>

                    <UTooltip text="Изменить">
                        <UButton color="gray"
                                 icon="i-heroicons-pencil-solid"
                                 square
                                 @click="editRow = row"/>
                    </UTooltip>

                    <UTooltip text="Удалить">
                        <UButton color="gray"
                                 icon="i-heroicons-trash-solid"
                                 :loading="removing[row.id] ?? false"
                                 @click="remove(row)"/>
                    </UTooltip>
                </div>
            </template>
        </UiSelectTable>
    </UiManagementMain>

    <ModalEditModel v-model="editRow"
                    :readonly="!(editRow?.can_edit ?? true)"
                    :save="save">
        <template #create-title>Новый человек</template>
        <template #edit-title="{state}">Человек #{{ state.id }}</template>

        <template #default="{state}">
            <UFormGroup label="Полное имя" name="name" required>
                <UInput v-model="state.name" placeholder="Стэнли Кубрик"/>
            </UFormGroup>

            <UFormGroup label="Оригинальное полное имя" name="original_name" required>
                <UInput v-model="state.original_name" placeholder="Stanley Kubrick"/>
            </UFormGroup>

            <UFormGroup label="Дата рождения" name="birth_date">
                <UInput type="date"
                        :model-value="state.birth_date ? undater(state.birth_date) : null"
                        @update:model-value="state.birth_date = dater($event)"/>
            </UFormGroup>

            <UFormGroup label="Дата смерти" name="death_date">
                <UInput type="date"
                        :model-value="state.death_date ? undater(state.death_date) : null"
                        @update:model-value="state.death_date = dater($event)"/>
            </UFormGroup>

            <UFormGroup label="Пол" name="sex">
                <USelectMenu :options="Object.values(PersonSex)"
                             placeholder="Выберите пол из списка"
                             v-model="state.sex">
                    <template #option="{option}">
                        {{ personSex(option) }}
                    </template>

                    <template v-if="state.sex" #label>
                        {{ personSex(state.sex) }}
                    </template>
                </USelectMenu>
            </UFormGroup>

            <UFormGroup label="Фото" name="photo">
                <UInput type="file" @input="state.photo = $event.target.files[0]"/>
            </UFormGroup>

            <UFormGroup label="Страна" name="country_id">
                <UiRepoSearchSelectId :repo="new CountryRepository()"
                                      placeholder="Выберите страну из списка"
                                      v-model="state.country_id">
                </UiRepoSearchSelectId>
            </UFormGroup>
        </template>
    </ModalEditModel>
</template>

<style scoped>

</style>