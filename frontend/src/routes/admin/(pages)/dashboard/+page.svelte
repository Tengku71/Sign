<script lang="ts">
  import { usersStore } from "$lib/stores";

  let users = $derived($usersStore);
</script>

<div class="w-full py-5 px-10">
  <div class="flex justify-between items-center mb-12">
    <h1 class="text-3xl font-bold text-white">Dashboard</h1>
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

  <div class="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center text-slate-400"></div>
</div>
