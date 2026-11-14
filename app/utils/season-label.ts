/** Подпись цели отзыва: «2 сезон» или «Весь сериал» для season = null. */
export default function (season?: number | null): string {
    return season ? `${season} сезон` : 'Весь сериал';
}
