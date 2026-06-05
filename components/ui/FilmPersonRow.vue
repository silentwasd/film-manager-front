<script setup lang="ts">
import {PersonRole} from "~/types/enums/PersonRole";
import FilmPersonRepository from "~/repos/FilmPersonRepository";
import type FilmPersonResource from "~/resources/FilmPersonResource";

const props = defineProps<{
    filmId: number,
    person?: FilmPersonResource,
    activeRole?: PersonRole | null
}>();

const emit = defineEmits<{
    (e: 'refresh'): void
}>();

const filmPersonRepo = new FilmPersonRepository(props.filmId);
const toast          = useToast();
const creating       = ref<boolean>(false);
const updating       = ref<boolean>(false);
const removing       = ref<boolean>(false);
const form           = ref();
const pickShown      = ref<boolean>(false);

const record = ref<Partial<FilmPersonResource>>(props.person ?? {
    id          : 0,
    person      : undefined,
    role        : undefined,
    role_details: ''
});

watch(() => props.activeRole, value => {
    if (value === null)
        record.value.role = undefined;
    else if (value !== undefined)
        record.value.role = value;
});

async function create() {
    creating.value = true;

    try {
        await filmPersonRepo.store({...record.value, person_id: record.value.person?.id ?? 0});
        emit('refresh');

        record.value = {
            id          : 0,
            person      : undefined,
            role        : props.activeRole,
            role_details: ''
        };
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
        creating.value = false;
    }
}

watchDebounced(record, async () => {
    if (updating.value || record.value.id == 0)
        return;

    updating.value = true;

    try {
        await filmPersonRepo.update({...record.value, person_id: record.value.person?.id ?? 0})
        emit('refresh');
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err?.message,
            color      : 'error'
        });
    } finally {
        updating.value = false;
    }
}, {debounce: 500, deep: true});

async function remove() {
    removing.value = true;

    try {
        await filmPersonRepo.remove(record.value.id);
        emit('refresh');
    } catch (err: any) {
        toast.add({
            title      : 'Ошибка',
            description: err?.data?.message || err?.message,
            color      : 'error'
        });
    } finally {
        removing.value = false;
    }
}
</script>

<template>
    <div>
        <div class="flex items-start gap-3">
            <div class="w-16 h-16 bg-cover bg-center bg-no-repeat rounded-lg shrink-0 relative group overflow-clip"
                 :style="`background-image: url(${record.person && record.person.photo ? fileUrl(record.person.photo) : '/img/person.jpg'});`">
                <div
                    class="opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur w-full h-full transition-opacity cursor-pointer"
                    @click="pickShown = true">
                    <UIcon name="i-heroicons-cursor-arrow-rays-solid" class="text-6xl drop-shadow"/>
                </div>
            </div>

            <div class="grow">
                <p class="font-medium line-clamp-1 mb-1.5">
                    {{ record.person ? record.person.name : 'Выберите человека' }}
                </p>

                <UForm ref="form" :state="record">
                    <div class="flex items-start gap-2.5 w-full">
                        <UFormField name="role" class="w-1/2">
                            <USelectMenu :items="Object.values(PersonRole)"
                                         class="w-full"
                                         placeholder="Выберите роль из списка"
                                         v-model="record.role">
                                <template #item-label="{item}">
                                    {{ personRole(item) }}
                                </template>

                                <template v-if="record.role" #default>
                                    {{ personRole(record.role) }}
                                </template>
                            </USelectMenu>
                        </UFormField>

                        <UFormField name="role_details" class="w-1/2">
                            <UInput placeholder="Доп. информация"
                                    class="w-full"
                                    v-model="record.role_details"/>
                        </UFormField>

                        <UButton v-if="record.id == 0"
                                 color="neutral"
                                 icon="i-heroicons-plus"
                                 :loading="creating"
                                 :disabled="creating || !record.person"
                                 @click="create"/>

                        <UButton v-else
                                 color="neutral"
                                 icon="i-heroicons-trash-solid"
                                 :loading="updating || removing"
                                 @click="remove"/>
                    </div>
                </UForm>
            </div>
        </div>
    </div>

    <ModalPickPerson v-model="pickShown" @picked="record.person = $event"/>
</template>

<style scoped>

</style>