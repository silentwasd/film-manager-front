<script setup lang="ts">
/**
 * Горизонтальная полка главной: заголовок, необязательная ссылка «Все» и
 * лента карточек в слоте. Листается стрелками, перетаскиванием мышью и
 * свайпом; края гаснут градиентом с той стороны, где есть ещё карточки.
 * Механика та же, что у ленты франшизы (ui/FranchiseRail.vue).
 */
defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    to?: string;
}>();

const strip = ref<HTMLElement>();

const canLeft  = ref(false);
const canRight = ref(false);

function updateEdges() {
    const el = strip.value;

    if (!el)
        return;

    canLeft.value  = el.scrollLeft > 4;
    canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
}

function page(direction: -1 | 1) {
    strip.value?.scrollBy({left: direction * strip.value.clientWidth * 0.8, behavior: 'smooth'});
}

const edgeMask = computed(() => {
    const left  = canLeft.value ? 'transparent, black 48px' : 'black, black';
    const right = canRight.value ? 'black calc(100% - 48px), transparent' : 'black, black';
    const mask  = `linear-gradient(to right, ${left}, ${right})`;

    return {maskImage: mask, WebkitMaskImage: mask};
});

// Перетаскивание мышью; тач листает нативно.
const dragging = ref(false);
let pointerId: number | null = null;
let startX                   = 0;
let startScroll              = 0;
let moved                    = false;

function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !strip.value)
        return;

    pointerId   = event.pointerId;
    startX      = event.clientX;
    startScroll = strip.value.scrollLeft;
    moved       = false;
}

function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId || !strip.value)
        return;

    const dx = event.clientX - startX;

    if (!moved && Math.abs(dx) < 5)
        return;

    if (!moved) {
        moved          = true;
        dragging.value = true;
        strip.value.setPointerCapture(event.pointerId);
    }

    strip.value.scrollLeft = startScroll - dx;
}

function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId)
        return;

    pointerId = null;

    if (strip.value?.hasPointerCapture(event.pointerId))
        strip.value.releasePointerCapture(event.pointerId);

    dragging.value = false;
}

// Кнопка, отпущенная после перетаскивания, не должна открывать карточку под курсором.
function onClickCapture(event: MouseEvent) {
    if (moved) {
        event.preventDefault();
        event.stopPropagation();
        moved = false;
    }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    updateEdges();

    if (strip.value) {
        resizeObserver = new ResizeObserver(updateEdges);
        resizeObserver.observe(strip.value);
    }
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<template>
    <section>
        <div class="flex items-end justify-between gap-4 mb-3">
            <div class="min-w-0">
                <h2 class="flex items-center gap-2 font-bold text-2xl">
                    <UIcon v-if="icon" :name="icon" class="size-6 shrink-0 text-primary"/>
                    <span class="truncate">{{ title }}</span>
                </h2>
                <p v-if="subtitle" class="text-sm text-muted mt-0.5">{{ subtitle }}</p>
            </div>

            <div class="flex items-center gap-1 shrink-0">
                <slot name="actions"/>

                <UButton v-if="to"
                         :to="to"
                         label="Все"
                         trailing-icon="i-lucide-chevron-right"
                         color="neutral"
                         variant="ghost"
                         size="sm"/>

                <UButton icon="i-lucide-chevron-left"
                         color="neutral"
                         variant="ghost"
                         size="sm"
                         aria-label="Назад"
                         class="hidden sm:inline-flex"
                         :disabled="!canLeft"
                         @click="page(-1)"/>

                <UButton icon="i-lucide-chevron-right"
                         color="neutral"
                         variant="ghost"
                         size="sm"
                         aria-label="Вперёд"
                         class="hidden sm:inline-flex"
                         :disabled="!canRight"
                         @click="page(1)"/>
            </div>
        </div>

        <!-- py-2 — место под тень и рамку при наведении: overflow-x режет и по вертикали -->
        <div ref="strip"
             class="flex items-start gap-3 overflow-x-auto py-2 -my-2 select-none
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
             :class="dragging ? 'cursor-grabbing' : 'snap-x'"
             :style="edgeMask"
             @scroll.passive="updateEdges"
             @pointerdown="onPointerDown"
             @pointermove="onPointerMove"
             @pointerup="onPointerUp"
             @pointercancel="onPointerUp"
             @click.capture="onClickCapture"
             @dragstart.prevent>
            <slot/>
        </div>
    </section>
</template>
