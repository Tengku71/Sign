<script lang="ts">
  import { onMount } from "svelte";
  import { Clock, Plus, Trash2, Save, X } from "@lucide/svelte";
  import { getAllModes, createMode, updateMode, getQuestions, createQuestion, deleteQuestion, updateQuestion } from "$lib/admin/kuis";

  let modes = $state<any[]>([]);
  let selectedModeId = $state<number | null>(null);
  let questions = $state<any[]>([]);
  let loading = $state(true);

  let newModeName = $state("");
  let newModeTime = $state(60);
  let editingModeId = $state<number | null>(null);

  let qInput = $state("");
  let addingQuestion = $state(false);
  let qError = $state("");
  let qSuccess = $state("");

  let editingQuestionId = $state<number | null>(null);
  let editInput = $state("");
  let editModeId = $state<number | null>(null);
  let savingEdit = $state(false);

  onMount(async () => {
    await fetchModes();
  });

  async function fetchModes() {
    const res = await getAllModes();
    if (res.success && res.data) {
      modes = res.data;
      if (modes.length > 0 && !selectedModeId) await selectMode(modes[0].id);
    }
    loading = false;
  }

  async function selectMode(id: number) {
    selectedModeId = id;
    cancelEdit();
    qError = "";
    qSuccess = "";
    const res = await getQuestions(id);
    questions = res.success ? res.data : [];
  }

  async function handleCreateMode(e: Event) {
    e.preventDefault();
    const res = await createMode(newModeName, newModeTime);
    if (res.success) {
      newModeName = "";
      newModeTime = 60;
      await fetchModes();
    } else alert(res.message);
  }

  async function handleUpdateMode(mode: any) {
    const res = await updateMode(mode.id, mode.name, mode.timeLimit);
    if (res.success) editingModeId = null;
  }

  async function handleAddQuestion(e: Event) {
    e.preventDefault();
    if (!selectedModeId || !qInput.trim()) return;
    addingQuestion = true;
    qError = "";
    qSuccess = "";

    const optionsArray = qInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (optionsArray.length === 0) {
      qError = "Please enter at least one item";
      addingQuestion = false;
      return;
    }

    const res = await createQuestion(optionsArray, selectedModeId);
    if (res.success) {
      qSuccess = `${optionsArray.length} items added!`;
      qInput = "";
      await selectMode(selectedModeId);
    } else {
      qError = res.message || "Failed to add";
    }
    addingQuestion = false;
  }

  function startEdit(q: any) {
    editingQuestionId = q.id;
    editInput = q.options.join(", ");
    editModeId = q.modeId;
  }

  function cancelEdit() {
    editingQuestionId = null;
    editInput = "";
  }

  async function handleSaveEdit(id: number) {
    savingEdit = true;
    const optionsArray = editInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (optionsArray.length === 0) {
      qError = "Cannot save empty array";
      savingEdit = false;
      return;
    }

    const res = await updateQuestion(id, optionsArray, editModeId || undefined);
    if (res.success) {
      qSuccess = "Question updated!";
      cancelEdit();
      if (selectedModeId) await selectMode(selectedModeId);
    } else {
      qError = res.message || "Failed to update";
    }
    savingEdit = false;
  }

  async function handleDeleteQuestion(id: number) {
    if (confirm("Delete this group?")) {
      await deleteQuestion(id);
      if (selectedModeId) await selectMode(selectedModeId);
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
</script>

<div class="w-full py-5 px-10 space-y-8">
  <h1 class="text-3xl font-bold text-white">Kuis Management</h1>

  {#if loading}
    <p class="text-slate-400">Loading...</p>
  {:else}
    <!-- SECTION 1: MODES (Unchanged) -->
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Clock class="w-5 h-5 text-blue-400" /> Kuis Modes
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {#each modes as mode}
          <div class="bg-white/5 rounded-xl p-4 border border-white/10">
            {#if editingModeId === mode.id}
              <input type="text" bind:value={mode.name} class="w-full bg-transparent text-white font-bold mb-2 border-b border-blue-500 outline-none pb-1" />
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs text-slate-400">Time:</span>
                <input type="number" bind:value={mode.timeLimit} class="w-20 bg-slate-700 text-white rounded px-2 py-1 text-sm outline-none" />
                <span class="text-xs text-slate-400">sec</span>
              </div>
              <div class="flex gap-2">
                <button onclick={() => handleUpdateMode(mode)} class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                <button onclick={() => (editingModeId = null)} class="text-xs bg-slate-600 text-white px-2 py-1 rounded">Cancel</button>
              </div>
            {:else}
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-white font-bold text-lg">{mode.name}</h3>
                  <p class="text-slate-400 text-sm mt-1">Time: <span class="text-blue-400 font-mono">{formatTime(mode.timeLimit)}</span></p>
                </div>
                <button onclick={() => (editingModeId = mode.id)} class="text-xs text-slate-400 hover:text-white border border-slate-600 px-2 py-1 rounded hover:bg-white/10">Edit</button>
              </div>
            {/if}
          </div>
        {/each}
        <form onsubmit={handleCreateMode} class="bg-white/5 rounded-xl p-4 border border-dashed border-white/20 flex flex-col justify-between">
          <div class="space-y-2 mb-3">
            <input type="text" bind:value={newModeName} placeholder="Mode Name" required class="w-full bg-transparent text-white placeholder-slate-500 outline-none border-b border-slate-600 pb-1" />
            <input type="number" bind:value={newModeTime} placeholder="Time (sec)" required min="10" class="w-full bg-transparent text-white placeholder-slate-500 outline-none border-b border-slate-600 pb-1" />
          </div>
          <button type="submit" class="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg py-2 text-sm font-medium hover:bg-blue-600/30 flex items-center justify-center gap-1">
            <Plus class="w-4 h-4" /> Add Mode
          </button>
        </form>
      </div>
    </div>

    <!-- SECTION 2: QUESTIONS WITH MODE TABS -->
    {#if modes.length > 0}
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <!-- MODE TABS -->
        <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
          {#each modes as mode}
            <button
              onclick={() => selectMode(mode.id)}
              class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors {selectedModeId === mode.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}"
            >
              {mode.name}
            </button>
          {/each}
        </div>

        <h2 class="text-xl font-semibold text-white mb-6">Questions for: <span class="text-blue-400">{modes.find((m) => m.id === selectedModeId)?.name}</span></h2>

        <!-- ADD QUESTION FORM -->
        <form onsubmit={handleAddQuestion} class="bg-black/20 rounded-xl p-4 mb-6 flex gap-3 items-end">
          <div class="flex-1">
            <label class="text-xs text-slate-400 mb-1 block">Options Array (comma separated)</label>
            <textarea bind:value={qInput} placeholder="A, B, C, Home, Car" required rows={2} class="w-full bg-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>
          <button type="submit" disabled={addingQuestion} class="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1 disabled:bg-emerald-400 shrink-0 h-[42px]">
            <Plus class="w-4 h-4" />
            {addingQuestion ? "..." : "Add"}
          </button>
        </form>

        {#if qError}<p class="text-red-400 text-sm mb-4">{qError}</p>{/if}
        {#if qSuccess}<p class="text-emerald-400 text-sm mb-4">{qSuccess}</p>{/if}

        <!-- LIST OF QUESTIONS -->
        {#if questions.length === 0}
          <p class="text-slate-500 text-center py-8 border border-dashed border-white/10 rounded-xl">No data added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each questions as q}
              <div class="bg-white/5 rounded-lg p-4 border border-white/10 relative hover:border-white/20 transition-colors">
                {#if editingQuestionId === q.id}
                  <!-- INLINE EDITOR -->
                  <div class="space-y-3">
                    <div>
                      <label class="text-xs text-slate-400 block mb-1">Edit Options</label>
                      <textarea bind:value={editInput} rows={2} class="w-full bg-slate-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    </div>
                    <div>
                      <label class="text-xs text-slate-400 block mb-1">Move to Mode</label>
                      <select bind:value={editModeId} class="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none">
                        {#each modes as m}
                          <option value={m.id}>{m.name}</option>
                        {/each}
                      </select>
                    </div>
                    <div class="flex gap-2 justify-end">
                      <button onclick={cancelEdit} class="px-3 py-1 bg-slate-600 text-slate-300 rounded text-sm flex items-center gap-1"><X class="w-3 h-3" /> Cancel</button>
                      <button onclick={() => handleSaveEdit(q.id)} disabled={savingEdit} class="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1 disabled:bg-blue-400"
                        ><Save class="w-3 h-3" /> {savingEdit ? "..." : "Save"}</button
                      >
                    </div>
                  </div>
                {:else}
                  <!-- DISPLAY MODE -->
                  <div class="flex flex-wrap gap-2 mr-20">
                    {#each q.options as opt}
                      <span class="bg-blue-500/20 text-blue-300 text-sm font-medium px-3 py-1 rounded-lg border border-blue-500/30">
                        {opt}
                      </span>
                    {/each}
                  </div>

                  <!-- ACTION BUTTONS -->
                  <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style="opacity: 1;">
                    <button onclick={() => startEdit(q)} class="text-slate-400 hover:text-blue-400 p-1" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg
                      >
                    </button>
                    <button onclick={() => handleDeleteQuestion(q.id)} class="text-slate-400 hover:text-red-400 p-1" title="Delete">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>
