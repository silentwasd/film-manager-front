export default defineNuxtRouteMiddleware(async (to, from) => {
    const token            = useToken();
    const {state, refresh} = useProfile();

    try {
        if (!state.value && token.value)
            await refresh();
    } catch {
        token.value = '';
    }
});