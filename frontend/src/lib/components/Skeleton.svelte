<script lang="ts">
  import { page } from "$app/state";
  import { logoutAdmin } from "$lib/admin/logout";
  import { LoaderCircle, LibraryBig, ClipboardClock, UserRoundPen, LogOut } from "@lucide/svelte";

  const navItems = [
    { href: "/admin/dashboard", label: "Loading . . .", icon: LoaderCircle },
    { href: "/admin/materi", label: "Loading . . .", icon: LoaderCircle },
    { href: "/admin/kuis", label: "Loading . . .", icon: LoaderCircle },
    { href: "/admin/user-akun", label: "Loading . . .", icon: LoaderCircle },
  ];
</script>

<div class="min-h-screen flex bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950">
  <div class="min-h-screen shrink-0 w-44 rounded-r-xl shadow-white shadow-[0_0_15px] bg-linear-to-tl from-blue-900 to-sky-700 flex flex-col">
    <div class="ps-5 text-3xl text-white font-bold mt-5 pb-4 border-b-2 border-white/20">
      <p>Loading..</p>
    </div>

    <nav class="my-5 mx-2 flex flex-col gap-y-2 flex-1">
      {#each navItems as item}
        {@const Icon = item.icon}

        <a
          href={item.href}
          class="text-white flex items-center gap-2 rounded cursor-pointer p-2 transition-colors duration-200
          "
        >
          <Icon class="animate-spin w-5 h-5 shrink-0" />
          <div>{item.label}</div>
        </a>
      {/each}
    </nav>

    <button onclick={logoutAdmin} class="text-white my-5 mx-2 flex items-center gap-2 rounded cursor-pointer p-2 transition-colors duration-200 hover:bg-white/15 font-semibold">
      <div class="animate-spin"><LoaderCircle /></div>
      <div class="">Loading . . .</div>
    </button>
  </div>
  <div class="w-full py-5 px-10">
    <div class="flex justify-between items-center mb-12">
      <h1 class="text-3xl font-bold text-white">Dashboard</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <p class="text-slate-400 text-sm mb-1">Total Users</p>
        <LoaderCircle class="text-3xl font-bold text-white animate-spin"/>
      </div>
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <p class="text-slate-400 text-sm mb-1">Active Sessions</p>
        <LoaderCircle class="text-3xl font-bold text-white animate-spin" />
      </div>
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <p class="text-slate-400 text-sm mb-1">Status</p>
        <LoaderCircle class="text-3xl font-bold text-emerald-400 animate-spin" />
      </div>
    </div>

    <div class="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center text-slate-400"></div>
  </div>
</div>
