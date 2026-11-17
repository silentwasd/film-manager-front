import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

/**
 * Живые обновления через Reverb. Соединение создаётся лениво — при первой
 * подписке и только у вошедшего: гостю личные каналы ни к чему.
 *
 * Канал приватный (users.<id>), авторизация — тем же Bearer-токеном Sanctum,
 * что и всё API: POST <api>/broadcasting/auth.
 */
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    let echo: Echo<'reverb'> | null = null;

    function get(): Echo<'reverb'> | null {
        if (echo) {
            return echo;
        }

        const token = useCookie('token').value;
        const key   = config.public.reverbKey as string | undefined;

        if (!token || !key) {
            return null;
        }

        const api  = new URL(config.public.apiUrl as string);
        const host = (config.public.reverbHost as string | undefined) || api.hostname;

        (window as any).Pusher = Pusher;

        echo = new Echo({
            broadcaster      : 'reverb',
            key,
            wsHost           : host,
            wsPort           : 443,
            wssPort          : 443,
            forceTLS         : true,
            enabledTransports: ['ws', 'wss'],
            authEndpoint     : `${api.origin}${api.pathname.replace(/\/$/, '')}/broadcasting/auth`,
            auth             : {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept       : 'application/json'
                }
            }
        });

        return echo;
    }

    return {provide: {echo: get}};
});
