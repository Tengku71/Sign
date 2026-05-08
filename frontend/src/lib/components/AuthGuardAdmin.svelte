<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount, setContext } from "svelte";
  import { authToken } from "$lib/stores";
  import type { Admin } from "$lib/types";
  import { getAdminProfile, getAllUsers } from "$lib/admin/getAdmin";
  import { get } from "svelte/store";
  import Skeleton from "./Skeleton.svelte";

  let isLoggedIn = $state(false);
  let loading = $state(true);

  let ctx = $state<{ adminData: Admin | null }>({
    adminData: null,
  });

  setContext("authCtx", ctx);

  const { content } = $props<{
    content: (props: { adminData: Admin }) => any;
  }>();

  onMount(() => {
    const t = get(authToken);
    if (!t) {
      goto("/admin/login");
      return;
    }
    isLoggedIn = true;
    init(t);
  });

  async function init(t: string) {
    loading = true;
    const [adminRes, usersRes] = await Promise.all([getAdminProfile(t), getAllUsers(t)]);
    if (adminRes.success) ctx.adminData = adminRes.data;
    // if (usersRes.success) ctx.userData = usersRes.data;
    loading = false;
  }
</script>

{#if loading}
  <div class="">
    <Skeleton />
  </div>
{:else if isLoggedIn && ctx.adminData}
  {@render content({ adminData: ctx.adminData })}
{/if}
