<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { authToken, refreshUsers, usersStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { getUserById } from "$lib/admin/getUser";
  import { updateUser } from "$lib/admin/updateUser";

  let token = $state("");
  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");
  let successMsg = $state("");

  const userId = $derived(Number(page.params.id));

  let email = $state("");
  let name = $state("");
  let password = $state("");
  let level = $state(1);
  let scores = $state(0);
  let isVerified = $state(false);

  onMount(() => {
    const unsub = authToken.subscribe(async (t) => {
      if (!t) {
        console.log("token", t);
        goto("/admin/login");
        return;
      }
      token = t;

      const res = await getUserById(t, userId);
      if (res.success && res.data) {
        email = res.data.email;
        name = res.data.name;
        level = res.data.level;
        scores = res.data.scores;
        isVerified = res.data.isVerified;
      } else {
        error = "Failed to load user.";
      }
      loading = false;
    });
    return unsub;
  });

  async function handleUpdate(e: Event) {
    e.preventDefault();
    error = "";
    successMsg = "";
    saving = true;
    const payload: any = { email, name, level: level, scores, isVerified };
    if (password.length >= 8) {
      payload.password = password;
    }

    const res = await updateUser(token, userId, payload);
    if (res.success) {
      successMsg = "User updated successfully!";
      usersStore.update((users) => users.map((u) => (u.id === userId ? { ...u, ...payload } : u)));
      setTimeout(() => goto("/admin/user-akun"), 1500);
    } else {
      error = res.message || "Update failed";
    }
    saving = false;
  }
</script>

<div class="w-full py-5 px-10">
  <h1 class="text-3xl font-bold text-white mb-8">Edit User</h1>

  {#if loading}
    <div class="text-slate-400">Loading user data...</div>
  {:else}
    <form onsubmit={handleUpdate} class="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-slate-300 mb-1">Name</label>
          <input type="text" bind:value={name} required class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input type="email" bind:value={email} required class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- New Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-slate-300 mb-1">New Password (leave blank to keep current)</label>
          <input type="password" bind:value={password} placeholder="Min. 8 characters" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Level -->
        <div>
          <label for="level" class="block text-sm font-medium text-slate-300 mb-1">Level</label>
          <input type="number" bind:value={level} required class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Scores -->
        <div>
          <label for="scores" class="block text-sm font-medium text-slate-300 mb-1">Scores</label>
          <input type="number" bind:value={scores} required class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Verified Toggle -->
        <div class="flex items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" bind:checked={isVerified} class="sr-only peer" />
            <div
              class="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
            <span class="ml-3 text-sm font-medium text-slate-300">
              {isVerified ? "Verified" : "Unverified"}
            </span>
          </label>
        </div>
      </div>

      {#if error}
        <div class="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm border border-red-500/50">{error}</div>
      {/if}
      {#if successMsg}
        <div class="bg-emerald-500/20 text-emerald-300 px-4 py-3 rounded-lg text-sm border border-emerald-500/50">{successMsg}</div>
      {/if}

      <div class="flex gap-4 pt-4">
        <button type="submit" disabled={saving} class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400">
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <a href="/admin/user-akun" class="px-6 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"> Cancel </a>
      </div>
    </form>
  {/if}
</div>
