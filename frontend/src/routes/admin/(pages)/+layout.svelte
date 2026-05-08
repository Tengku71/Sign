<script lang="ts">
  import { getAllUsers } from "$lib/admin/getAdmin";
  import AuthGuard from "$lib/components/AuthGuardAdmin.svelte";
  import SideNav from "$lib/components/SideNav.svelte";
  import { authToken, usersStore } from "$lib/stores";
  import "./../../layout.css";
  let { children } = $props();

  authToken.subscribe(async (t) => {
    if (!t) return;
    const res = await getAllUsers(t);
    if (res.success) usersStore.set(res.data);
  });
</script>

<AuthGuard>
  {#snippet content({ adminData })}
    <div class="min-h-screen flex bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950">
      <SideNav data={adminData} />
      {@render children()}
    </div>
  {/snippet}
</AuthGuard>
