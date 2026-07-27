import {CollectionVisibility} from "~/types/enums/CollectionVisibility";

interface VisibilityMeta {
    label: string;
    icon: string;
    color: 'primary' | 'neutral';
    hint: string;
}

const meta: Record<CollectionVisibility, VisibilityMeta> = {
    [CollectionVisibility.Public]  : {
        label: 'Публичная',
        icon : 'i-heroicons-globe-alt-20-solid',
        color: 'primary',
        hint : 'Открыта по ссылке, видна в вашем профиле и попадает в поисковые системы.'
    },
    [CollectionVisibility.Personal]: {
        label: 'Личная',
        icon : 'i-heroicons-user-circle-20-solid',
        color: 'neutral',
        hint : 'Открыта по ссылке и видна в вашем профиле, но не индексируется.'
    },
    [CollectionVisibility.Hidden]  : {
        label: 'Скрытая',
        icon : 'i-heroicons-lock-closed-20-solid',
        color: 'neutral',
        hint : 'Видна только вам. Не открывается по ссылке и не показывается в профиле.'
    }
};

export default function (visibility?: CollectionVisibility): VisibilityMeta {
    return meta[visibility ?? CollectionVisibility.Hidden];
}
