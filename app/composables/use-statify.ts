export default function <T>(key: string, defaultValue: () => T) {
    const state = useState<T>(key, defaultValue);

    watch(state, value => {
        //localStorage.setItem(key, JSON.stringify(value));
    });

    onMounted(() => {
        //const item = localStorage.getItem(key);
        //if (item)
        //    state.value = JSON.parse(item);
    });

    return state;
}