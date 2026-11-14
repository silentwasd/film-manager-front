/**
 * Адрес постера для карточек, лент и сеток: WebP-превью шириной 360 px,
 * если бэкенд его нарезал, иначе исходник. Исходник весит в среднем 670 КБ,
 * превью — около 30 КБ. Страница фильма и OG берут исходник через fileUrl.
 */
export default function (film?: { cover?: string | File | null, cover_thumb?: string | null } | null): string {
    const path = film?.cover_thumb || (typeof film?.cover === 'string' ? film.cover : '');

    return path ? fileUrl(path) : '';
}
