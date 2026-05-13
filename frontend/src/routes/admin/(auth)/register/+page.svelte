<!-- src/routes/admin/register/+page.svelte -->
<script lang="ts">
  import { registerAdmin, verifyCode } from "$lib/admin/register";

  let isVerified = $state(false);
  let token = $state("");

  let code = $state("");
  let codeLoading = $state(false);
  let codeError = $state("");

  let email = $state("");
  let name = $state("");
  let password = $state("");
  let confirm = $state("");
  let showPw = $state(false);
  let regLoading = $state(false);
  let regError = $state("");
  let success = $state(false);
  let errs = $state<Record<string, string>>({});

  function handleCodeInput(e: Event) {
    const input = e.target as HTMLInputElement;
    code = input.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
  }

  async function handleVerify(e: Event) {
    e.preventDefault();
    if (code.length !== 8 || codeLoading) return;
    codeLoading = true;
    codeError = "";

    const res = await verifyCode(code);
    if (res.success && res.access_token) {
      token = res.access_token;
      isVerified = true;
    } else {
      codeError = res.message || "Invalid code";
    }
    codeLoading = false;
  }

  const strength = $derived(() => {
    if (!password) return { score: 0, text: "", cls: "" };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    if (s <= 1) return { score: 1, text: "Weak", cls: "bg-red-500 text-red-500" };
    if (s <= 2) return { score: 2, text: "Fair", cls: "bg-amber-500 text-amber-500" };
    if (s <= 3) return { score: 3, text: "Good", cls: "bg-blue-500 text-blue-500" };
    return { score: 4, text: "Strong", cls: "bg-emerald-500 text-emerald-500" };
  });

  function validate() {
    errs = {};
    if (!email) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!name || name.length < 2) errs.name = "Min 2 characters";
    if (!password || password.length < 8) errs.password = "Min 8 characters";
    if (password !== confirm) errs.confirm = "Passwords do not match";
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(e: Event) {
    e.preventDefault();
    regError = "";
    if (!validate()) return;
    regLoading = true;

    const res = await registerAdmin({ email, name, password });
    if (res.id) {
      success = true;
    } else {
      regError = res.message || "Registration failed";
    }
    regLoading = false;
  }

  const pw = $derived(strength());
</script>

<div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
  {#if success}
    <div class="bg-white rounded-2xl p-10 w-full max-w-md text-center shadow-2xl animate-[fade-in_0.3s_ease-out]">
      <div class="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Success!</h1>
      <p class="text-slate-500 mb-8">Admin account created successfully.</p>
    </div>
  {:else if !isVerified}
    <div class="bg-white rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
      <div class="text-indigo-500 mb-6 flex justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      <h1 class="text-3xl font-bold text-slate-900 mb-2">Admin Access</h1>
      <p class="text-slate-500 mb-8 text-sm">Enter your 8-character validation code to proceed</p>

      <form onsubmit={handleVerify} class="relative">
        <div class="flex gap-3 justify-center mb-6">
          {#each Array(8) as _, i}
            <div
              class="w-12 h-14 border-2 rounded-lg flex items-center justify-center text-xl font-bold text-slate-800 uppercase transition-all duration-150
              {code[i] ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}
              {i === code.length ? 'border-indigo-500 ring-4 ring-indigo-100' : ''}"
            >
              {code[i] || ""}
            </div>
          {/each}
        </div>

        <input type="text" value={code} oninput={handleCodeInput} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" maxlength="8" required />

        {#if codeError}
          <p class="text-red-500 text-sm mb-4">{codeError}</p>
        {/if}

        <button
          type="submit"
          disabled={code.length !== 8 || codeLoading}
          class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold transition-all
            hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5
            disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
        >
          {codeLoading ? "Verifying..." : "Verify Code"}
        </button>
      </form>
    </div>
  {:else}
    <div class="bg-white rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl animate-[fade-in_0.3s_ease-out]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
          <p class="text-slate-500 text-sm">Set up your admin credentials</p>
        </div>
        <button
          onclick={() => {
            isVerified = false;
            token = "";
          }}
          class="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back
        </button>
      </div>

      <form onsubmit={handleRegister} class="space-y-5">
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

        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
          <input
            type="text"
            bind:value={name}
            placeholder="John Doe"
            class="w-full px-4 py-2.5 rounded-lg border-2 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100
              {errs.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}"
          />
          {#if errs.name}<p class="text-red-500 text-xs mt-1">{errs.name}</p>{/if}
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
          <div class="relative">
            <input
              type={showPw ? "text" : "password"}
              bind:value={password}
              placeholder="Min. 8 characters"
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

          {#if password}
            <div class="flex items-center gap-2 mt-2">
              <div class="flex gap-1 flex-1 h-1">
                {#each [1, 2, 3, 4] as i}
                  <div class="flex-1 rounded-full transition-colors duration-300 {i <= pw.score ? pw.cls.split(' ')[0] : 'bg-slate-200'}"></div>
                {/each}
              </div>
              <span class="text-xs font-medium {pw.cls.split(' ')[1]}">{pw.text}</span>
            </div>
          {/if}
          {#if errs.password}<p class="text-red-500 text-xs mt-1">{errs.password}</p>{/if}
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="repeatpassword" class="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
          <input
            type={showPw ? "text" : "password"}
            bind:value={confirm}
            placeholder="Repeat password"
            class="w-full px-4 py-2.5 rounded-lg border-2 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100
              {errs.confirm ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}"
          />
          {#if errs.confirm}<p class="text-red-500 text-xs mt-1">{errs.confirm}</p>{/if}
        </div>

        {#if regError}
          <div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">{regError}</div>
        {/if}

        <button
          type="submit"
          disabled={regLoading}
          class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold transition-all
            hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5
            disabled:bg-indigo-200 disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
        >
          {regLoading ? "Creating..." : "Create Admin Account"}
        </button>
      </form>
    </div>
  {/if}
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
