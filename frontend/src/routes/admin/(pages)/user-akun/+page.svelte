<script lang="ts">
  import { UserRoundPen, UserRoundPlus, UserRoundX } from "@lucide/svelte";
  import { authToken, refreshUsers, usersStore } from "$lib/stores";
  import type { User } from "$lib/types";
  import { deleteUser } from "$lib/admin/deleteUser";

  let users = $derived($usersStore);
  let showDeleteModal = $state(false);
  let userToDelete = $state<User | null>(null);
  let deleting = $state(false);
  let deleteError = $state("");

  function openDeleteModal(user: User) {
    userToDelete = user;
    deleteError = "";
    showDeleteModal = true;
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    deleting = true;
    deleteError = "";

    let currentToken: string = "";
    const unsub = authToken.subscribe((t) => (currentToken = t ?? ""));
    unsub();

    const res = await deleteUser(currentToken, userToDelete.id);

    if (res.success) {
      usersStore.update((list) => list.filter((u) => u.id !== userToDelete!.id));
      showDeleteModal = false;
      userToDelete = null;
      refreshUsers.update((n) => n + 1);
    } else {
      deleteError = res.message || "Failed to delete";
    }
    deleting = false;
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") showDeleteModal = false;
  }
</script>

<div class="w-full py-5 px-10">
  <div class="flex justify-between items-center mb-12">
    <h1 class="text-3xl font-bold text-white">User Akun</h1>
    <a href="/admin/user-akun/tambah" class="text-white flex items-center text-xl gap-2 cursor-pointer rounded p-2 hover:bg-white/25">
      <div class=""><UserRoundPlus /></div>
      <div class="">Add</div>
    </a>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <p class="text-slate-400 text-sm mb-1">Total Users</p>
      <p class="text-3xl font-bold text-white">{users.length}</p>
    </div>
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <p class="text-slate-400 text-sm mb-1">Active Sessions</p>
      <p class="text-3xl font-bold text-white">1</p>
    </div>
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <p class="text-slate-400 text-sm mb-1">Status</p>
      <p class="text-3xl font-bold text-emerald-400">Healthy</p>
    </div>
  </div>
  <div class="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center text-slate-400">
    {#if !users}
      <div class="p-10 text-center text-slate-400">Loading users...</div>
    {:else if users.length === 0}
      <div class="p-10 text-center text-slate-400">No users found. Create one above!</div>
    {:else}
      <table class="w-full text-sm text-left">
        <thead class="text-xs text-slate-500 uppercase rounded-3xl bg-slate-50">
          <tr>
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3 text-center">Level</th>
            <th class="px-6 py-3 text-center">Scores</th>
            <th class="px-6 py-3 text-center">Status</th>
            <th class="px-6 py-3 text-right">Joined</th>
            <th class="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y rounded divide-slate-100">
          {#each users as user}
            <tr class="hover:bg-slate-50 hover:text-black text-white transition-colors">
              <td class="px-6 py-4 font-medium">{user.name}</td>
              <td class="px-6 py-4">{user.email}</td>
              <td class="px-6 py-4 text-center">
                <span class="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Lv. {user.level}
                </span>
              </td>
              <td class="px-6 py-4 text-center font-semibold">{user.scores}</td>
              <td class="px-6 py-4 text-center">
                {#if user.isVerified}
                  <span class="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified</span>
                {:else}
                  <span class="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Unverified</span>
                {/if}
              </td>
              <td class="px-6 py-4 text-right">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td class="px-6 py-4 flex justify-between items-center">
                <a href="/admin/user-akun/edit/{user.id}" class="text-yellow-400 hover:text-blue-300 font-medium text-sm cursor-pointer">
                  <UserRoundPen />
                </a>
                <button type="button" onclick={() => openDeleteModal(user)} class="text-red-400 hover:text-red-300 font-medium text-sm cursor-pointer">
                  <UserRoundX />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  {#if showDeleteModal && userToDelete}
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onclick={() => (showDeleteModal = false)}
      onkeydown={handleBackdropKeydown}
    >
      <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
        <h3 id="delete-modal-title" class="text-xl font-bold text-white mb-2">Delete User</h3>
        <p class="text-slate-400 mb-6">
          Are you sure you want to delete <span class="text-white font-semibold">{userToDelete.name}</span>? This action cannot be undone.
        </p>

        {#if deleteError}
          <div class="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm border border-red-500/50 mb-4">{deleteError}</div>
        {/if}

        <div class="flex justify-end gap-3">
          <button type="button" onclick={() => (showDeleteModal = false)} class="px-5 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"> Cancel </button>
          <button type="button" onclick={confirmDelete} disabled={deleting} class="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-red-400/50 disabled:cursor-not-allowed">
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
