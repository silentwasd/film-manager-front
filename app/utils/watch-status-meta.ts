import {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

/**
 * Как статус просмотра выглядит на постере: подпись, иконка и цвет значка.
 */
export default function (status: FilmWatchStatus) {
    switch (status) {
        case FilmWatchStatus.Watched:
            return {label: 'Просмотрено', icon: 'i-lucide-check', classes: 'bg-emerald-500 text-white'};
        case FilmWatchStatus.MustFinish:
            return {label: 'Нужно досмотреть', icon: 'i-lucide-play', classes: 'bg-amber-500 text-white'};
        case FilmWatchStatus.ToWatch:
            return {label: 'Можно посмотреть', icon: 'i-lucide-bookmark', classes: 'bg-sky-500 text-white'};
        case FilmWatchStatus.Dropped:
            return {label: 'Пропущено', icon: 'i-lucide-x', classes: 'bg-neutral-500 text-white'};
    }
}
