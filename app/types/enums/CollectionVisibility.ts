export enum CollectionVisibility {
    /** Своя страница, видна в профиле автора, попадает в sitemap. */
    Public   = 'public',
    /** Своя страница и строка в профиле автора, но вне sitemap. */
    Personal = 'personal',
    /** Доступна только владельцу. */
    Hidden   = 'hidden'
}
