import type ProfileResource from "~/resources/management/ProfileResource";
import ProfileRepository from "~/repos/management/ProfileRepository";

export default function () {
    const token = useToken();

    const state = useState<ProfileResource | null>('profile', () => null);

    async function refresh() {
        const profileRepo = new ProfileRepository();
        const profile     = await profileRepo.get();
        state.value       = profile.data ?? null;
    }

    async function logout() {
        state.value = null;
        token.value = '';
        await reloadNuxtApp({persistState: false});
    }

    return {state, refresh, logout};
};