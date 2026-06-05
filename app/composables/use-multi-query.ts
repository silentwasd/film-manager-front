export default function (name: string) {
    const route = useRoute();
    return ref<number[]>((((Array.isArray(route.query[`${name}[]`]) ? route.query[`${name}[]`] : (route.query[`${name}[]`] ? [route.query[`${name}[]`]] : [])) as string[]) ?? []).map(item => parseInt(item)));
}