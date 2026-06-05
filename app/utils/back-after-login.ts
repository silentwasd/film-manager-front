export default function () {
    const route      = useRoute();
    const afterLogin = useCookie<string>('after_login');
    afterLogin.value = route.path;
    navigateTo('/login');
}