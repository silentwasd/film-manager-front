export default function (tableName: string, extraQuery: () => any = () => ({}), extraClear: () => void = () => {}) {
    const route  = useRoute();

    const name     = ref((route.query.name ?? '') as string);
    const page     = ref<number>(parseInt((route.query.page ?? '1') as string));
    const selected = ref([]);
    const perPage  = useStatify<number>(`${tableName}_per_page`, () => 10);
    const sort     = useStatify<{ column: string, direction: "desc" | "asc" }>(`${tableName}_sort`, () => ({
        column   : 'id',
        direction: 'desc'
    }));

    watch(() => [name.value, page.value, ...Object.values(extraQuery())], () => {
        navigateTo('?' + querify({name: name.value, page: page.value, ...extraQuery()}));
    });

    watch(() => [name.value, ...Object.values(extraQuery())], () => page.value = 1);

    function clearFilters() {
        name.value = '';
        page.value = 1;
        extraClear();
    }

    return {name, page, perPage, sort, selected, clearFilters};
}