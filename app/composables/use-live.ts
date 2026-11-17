/**
 * Подписка на «у тебя что-то поменялось» по теме (plans, friends).
 * Событие без данных — handler обычно просто перечитывает список.
 *
 * После обрыва связи handler вызывается ещё раз: пока сокета не было,
 * события могли пролететь мимо.
 */
export default function (topic: 'plans' | 'friends', handler: () => void) {
    if (import.meta.server) {
        return;
    }

    const {$echo}          = useNuxtApp();
    const {state: profile} = useProfile();

    let channelName: string | null = null;
    let unbindState: (() => void) | null = null;

    const listener = (event: { topic?: string }) => {
        if (event.topic === topic) {
            handler();
        }
    };

    function subscribe(userId: number) {
        const echo = ($echo as () => any)();

        if (!echo) {
            return;
        }

        channelName = `users.${userId}`;
        echo.private(channelName).listen('.changed', listener);

        const connection = echo.connector.pusher.connection;
        let wasConnected = connection.state === 'connected';

        const onState = ({current}: { current: string }) => {
            if (current === 'connected') {
                if (wasConnected) {
                    handler();
                }
                wasConnected = true;
            }
        };

        connection.bind('state_change', onState);
        unbindState = () => connection.unbind('state_change', onState);
    }

    function unsubscribe() {
        if (channelName) {
            ($echo as () => any)()?.private(channelName).stopListening('.changed', listener);
            channelName = null;
        }

        unbindState?.();
        unbindState = null;
    }

    onMounted(() => {
        watch(() => profile.value?.id, id => {
            unsubscribe();

            if (id) {
                subscribe(id);
            }
        }, {immediate: true});
    });

    onBeforeUnmount(unsubscribe);
}
