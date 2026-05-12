<script lang="ts">
  import SideNav from "$lib/components/SideNav.svelte";
  import { onMount } from "svelte";
  import "./../../layout.css";
  import { getAdminProfile, getAllUsers } from "$lib/admin/getAdmin";
  import { adminStore, usersStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import Skeleton from "$lib/components/Skeleton.svelte";
  let { children } = $props();

  let isLoggedIn = $state(false);
  let loading = $state(true);

  let data = $derived($adminStore);

  onMount(async () => {
    loading = true;

    const [adminRes, usersRes] = await Promise.all([getAdminProfile(), getAllUsers()]);

    if (usersRes.success) {
      usersStore.set(usersRes.data);
    }

    if (adminRes.success) {
      adminStore.set(adminRes.data);
      isLoggedIn = true;
    } else {
      goto("/admin/login");
    }

    loading = false;
  });
</script>

{#if loading}
  <Skeleton />
{:else if isLoggedIn}
  <div class="h-screen flex overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950">
    <SideNav {data} />

    <main class="flex-1 overflow-y-auto">
      {@render children()}
    </main>
  </div>
{/if}
