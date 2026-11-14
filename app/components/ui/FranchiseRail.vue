<script setup lang="ts">
import type Film from "~/resources/Film";
import {FilmFormat} from "~/types/enums/FilmFormat";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

/**
 * Горизонтальная лента тайтлов франшизы. При монтировании доезжает до
 * текущего тайтла — поэтому родитель пересоздаёт её (:key) при смене франшизы.
 *
 * Листается стрелками по краям, клавишами ←/→ (когда лента в фокусе),
 * перетаскиванием мышью и, на тачскрине, обычным свайпом.
 */
const props = defineProps<{
    films: Film[];          // уже в нужном порядке
    currentId: number;
    statuses?: Record<number, FilmWatchStatus>;
}>();

const SERIES_FORMATS = [FilmFormat.Series, FilmFormat.MiniSeries, FilmFormat.CartoonSeries];

const strip = ref<HTMLElement>();

// --- стрелки: видны, только когда есть куда листать ---

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
    const el = strip.value;

    if (el)
        el.scrollBy({left: direction * el.clientWidth * 0.8, behavior: 'smooth'});
}

function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        page(event.key === 'ArrowLeft' ? -1 : 1);
    }
}

// Края ленты гаснут градиентом с той стороны, где есть ещё карточки.
const edgeMask = computed(() => {
    const left  = canLeft.value ? 'transparent, black 48px' : 'black, black';
    const right = canRight.value ? 'black calc(100% - 48px), transparent' : 'black, black';
    const mask  = `linear-gradient(to right, ${left}, ${right})`;

    return {maskImage: mask, WebkitMaskImage: mask};
});

// --- перетаскивание мышью (тач листает сам, нативно) ---

const DRAG_THRESHOLD = 5;

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

    if (!moved && Math.abs(dx) < DRAG_THRESHOLD)
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

// Отпущенная после перетаскивания кнопка не должна открывать фильм под курсором.
function onClickCapture(event: MouseEvent) {
    if (moved) {
        event.preventDefault();
        event.stopPropagation();
        moved = false;
    }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    // Доезжаем до текущего тайтла, не трогая вертикальную прокрутку страницы.
    const current = strip.value?.querySelector<HTMLElement>('[data-current]');

    if (strip.value && current)
        strip.value.scrollLeft = current.offsetLeft - (strip.value.clientWidth - current.offsetWidth) / 2;

    updateEdges();

    if (strip.value) {
        resizeObserver = new ResizeObserver(updateEdges);
        resizeObserver.observe(strip.value);
    }
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<template>
    <div class="relative -mx-2">
        <!-- p-2 — место под рамку текущей карточки: overflow-x режет и по вертикали -->
        <div ref="strip"
             tabindex="0"
             aria-label="Тайтлы франшизы, листать стрелками"
             class="relative flex items-start gap-2 overflow-x-auto p-2 outline-none select-none
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                    focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
             :class="dragging ? 'cursor-grabbing' : 'cursor-grab snap-x'"
             :style="edgeMask"
             @scroll.passive="updateEdges"
             @keydown="onKey"
             @pointerdown="onPointerDown"
             @pointermove="onPointerMove"
             @pointerup="onPointerUp"
             @pointercancel="onPointerUp"
             @click.capture="onClickCapture"
             @dragstart.prevent>
            <div v-for="film in films"
                 :key="film.id"
                 :data-current="film.id == currentId ? '' : undefined"
                 class="flex snap-start scroll-ms-2 shrink-0 rounded-xl p-1.5"
                 :class="film.id == currentId ? 'ring-2 ring-primary bg-primary/10' : ''">
                <UiTimelineCard :film="film"
                                :branch="SERIES_FORMATS.includes(film.format) ? 'series' : 'films'"
                                :status="statuses?.[film.id]"/>
            </div>
        </div>

        <!-- Стрелки по центру постеров (постер 2:3 при ширине 130px ≈ 195px) -->
        <UButton v-show="canLeft"
                 icon="i-lucide-chevron-left"
                 color="neutral"
                 variant="solid"
                 size="lg"
                 aria-label="Назад"
                 tabindex="-1"
                 class="absolute left-1 top-[calc(0.5rem+0.375rem+97px)] -translate-y-1/2 z-10 rounded-full shadow-lg opacity-90 hover:opacity-100"
                 @click="page(-1)"/>

        <UButton v-show="canRight"
                 icon="i-lucide-chevron-right"
                 color="neutral"
                 variant="solid"
                 size="lg"
                 aria-label="Вперёд"
                 tabindex="-1"
                 class="absolute right-1 top-[calc(0.5rem+0.375rem+97px)] -translate-y-1/2 z-10 rounded-full shadow-lg opacity-90 hover:opacity-100"
                 @click="page(1)"/>
    </div>
</template>
