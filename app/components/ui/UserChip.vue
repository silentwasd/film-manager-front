<script setup lang="ts">
import type UserCard from "~/resources/management/UserCard";

defineProps<{ user: UserCard }>();
</script>

<template>
    <NuxtLink :to="`/users/${user.public_key}`" class="flex items-center gap-2.5 min-w-0 group">
        <span class="flex w-9 h-9 bg-linear-to-tr from-orange-700 to-fuchsia-400 rounded-full shrink-0">
            <span class="m-auto font-bold text-white uppercase">{{ user.name.slice(0, 1) }}</span>
        </span>

        <span class="font-medium truncate group-hover:underline underline-offset-2">{{ user.name }}</span>
    </NuxtLink>
</template>
