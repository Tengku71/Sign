<script lang="ts">
  import { page } from "$app/state";
  import { logoutAdmin } from "$lib/admin/logout";
  import { LayoutPanelLeft, LibraryBig, ClipboardClock, UserRoundPen, LogOut } from "@lucide/svelte";

  const { data } = $props();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutPanelLeft },
    { href: "/admin/materi", label: "Materi", icon: LibraryBig },
    { href: "/admin/kuis", label: "Kuis Waktu", icon: ClipboardClock },
    { href: "/admin/user-akun", label: "User Akun", icon: UserRoundPen },
  ];

  const currentPath = $derived(page.url.pathname);
</script>

<div class="min-h-screen shrink-0 w-44 rounded-r-xl shadow-white shadow-[0_0_15px] bg-linear-to-tl from-blue-900 to-sky-700 flex flex-col">
  <div class="ps-5 text-3xl text-white font-bold mt-5 pb-4 border-b-2 border-white/20">
    {data.name}
  </div>

  <nav class="my-5 mx-2 flex flex-col gap-y-2 flex-1">
    {#each navItems as item}
      {@const Icon = item.icon}

      <a
        href={item.href}
        class="text-white flex items-center gap-2 rounded cursor-pointer p-2 transition-colors duration-200
          {currentPath.startsWith(item.href) ? 'bg-white/25 font-extrabold' : 'hover:bg-white/15 font-semibold'}"
      >
        <Icon class="w-5 h-5 shrink-0" />
        <div>{item.label}</div>
      </a>
    {/each}
  </nav>

  <button onclick={logoutAdmin} class="text-white my-5 mx-2 flex items-center gap-2 rounded cursor-pointer p-2 transition-colors duration-200 hover:bg-white/15 font-semibold">
    <div class=""><LogOut /></div>
    <div class="">Logout</div>
  </button>
</div>
