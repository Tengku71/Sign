<script lang="ts">
  import { ArrowLeft } from "@lucide/svelte";
  import { getContext } from "svelte";
  import { createUser } from "$lib/admin/addUser";

  let token = $state("");

  let email = $state("");
  let name = $state("");
  let password = $state("");
  let isVerified = $state(true);
  let showPw = $state(false);
  let loading = $state(false);
  let error = $state("");
  let successMsg = $state("");
  let errs = $state<Record<string, string>>({});

  function validate() {
    errs = {};
    if (!email) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!name) errs.name = "Min 2 characters";
    if (!password || password.length < 8) errs.password = "Min 8 characters";
    return Object.keys(errs).length === 0;
  }

  async function handleCreate(e: Event) {
    e.preventDefault();
    error = "";
    successMsg = "";
    if (!validate()) return;
    loading = true;

    const res = await createUser(token, { email, name, password, isVerified });
    if (res.success) {
      successMsg = `User "${name}" created successfully!`;
      email = "";
      name = "";
      password = "";
      isVerified = true;
    } else {
      error = res.message || "Failed to create user";
    }
    loading = false;
  }
</script>

<div class="w-full py-5 px-10">
  <!-- Create User Form -->
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-5">
    <a href="/admin/user-akun" class="flex mb-4 items-center gap-2 bg-blue-600 w-fit py-1 px-2 cursor-pointer text-white rounded">
      <div class=""><ArrowLeft /></div>
      <div class="">Kembali</div>
    </a>
    <h2 class="text-lg font-semibold text-slate-700 mb-4">Add User</h2>

    <form onsubmit={handleCreate} class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="name" class="block text-sm font-medium text-slate-600 mb-1">Name</label>
        <input
          type="text"
          bind:value={name}
          placeholder="John Doe"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm
            {errs.name ? 'border-red-500' : ''}"
        />
        {#if errs.name}<p class="text-red-500 text-xs mt-1">{errs.name}</p>{/if}
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-slate-600 mb-1">Email</label>
        <input
          type="email"
          bind:value={email}
          placeholder="user@example.com"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm
            {errs.email ? 'border-red-500' : ''}"
        />
        {#if errs.email}<p class="text-red-500 text-xs mt-1">{errs.email}</p>{/if}
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-slate-600 mb-1">Password</label>
        <div class="relative">
          <input
            type={showPw ? "text" : "password"}
            bind:value={password}
            placeholder="Min. 8 characters"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm pr-10
              {errs.password ? 'border-red-500' : ''}"
          />

          <button type="button" onclick={() => (showPw = !showPw)} class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {#if showPw}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                /></svg
              >
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                ><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                /></svg
              >
            {/if}
          </button>
        </div>
        {#if errs.password}<p class="text-red-500 text-xs mt-1">{errs.password}</p>{/if}
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-slate-600">Email Status</span>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" bind:checked={isVerified} class="sr-only peer" />
          <div
            class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
          ></div>
          <span class="ml-3 text-sm font-medium text-slate-700 min-w-20">
            {isVerified ? "Verified" : "Unverified"}
          </span>
        </label>
      </div>

      <div class="flex items-end">
        <button type="submit" disabled={loading} class="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed">
          {loading ? "Creating..." : "Add User"}
        </button>
      </div>
    </form>

    {#if error}
      <div class="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">{error}</div>
    {/if}
    {#if successMsg}
      <div class="mt-4 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg text-sm border border-emerald-200">{successMsg}</div>
    {/if}
  </div>
</div>
