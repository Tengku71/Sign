<script lang="ts">
  import { goto } from "$app/navigation";
  import { loginAdmin } from "$lib/admin/login";
  import { authToken } from "$lib/stores";

  import type { User } from "$lib/types";

  let email = $state("");
  let password = $state("");
  let showPw = $state(false);
  let loading = $state(false);
  let error = $state("");
  let errs = $state<Record<string, string>>({});

  function validate() {
    errs = {};
    if (!email) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!password) errs.password = "Required";
    return Object.keys(errs).length === 0;
  }

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = "";
    if (!validate()) return;
    loading = true;

    const res = await loginAdmin({ email, password });
    if (res.success && res.access_token) {
      authToken.set(res.access_token);
      goto("/admin/dashboard");
    } else {
      error = res.message || "Login failed";
    }
    loading = false;
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
  <div class="bg-white rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl">
    <div class="text-center mb-8">
      <div class="w-12 h-12 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h1>
      <p class="text-slate-500 text-sm">Login to your admin account</p>
    </div>

    <form onsubmit={handleLogin} class="space-y-5">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
        <input
          type="email"
          bind:value={email}
          placeholder="admin@company.com"
          class="w-full px-4 py-2.5 rounded-lg border-2 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100
            {errs.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}"
        />
        {#if errs.email}<p class="text-red-500 text-xs mt-1">{errs.email}</p>{/if}
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
        <div class="relative">
          <input
            type={showPw ? "text" : "password"}
            bind:value={password}
            placeholder="Enter your password"
            class="w-full px-4 py-2.5 pr-12 rounded-lg border-2 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100
              {errs.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}"
          />
          <button type="button" onclick={() => (showPw = !showPw)} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
            {#if showPw}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                /></svg
              >
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg
              >
            {/if}
          </button>
        </div>
        {#if errs.password}<p class="text-red-500 text-xs mt-1">{errs.password}</p>{/if}
      </div>

      {#if error}
        <div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">{error}</div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold transition-all
          hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5
          disabled:bg-indigo-200 disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-slate-500">
      Need an account?
      <a href="/admin/register" class="text-indigo-600 font-semibold hover:underline">Register here</a>
    </div>
  </div>
</div>
