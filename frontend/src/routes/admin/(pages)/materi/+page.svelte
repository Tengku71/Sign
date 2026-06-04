<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Trash2, FileUp, FolderPlus, Folder, X } from "@lucide/svelte";
  import { getAllMateri, uploadMateri, createFolder, getAllFolders, deleteFolder, deleteMateri } from "$lib/admin/materi";
  import { API } from "$lib/types";

  let materiList = $state<any[]>([]);
  let folderList = $state<any[]>([]);
  let loadingData = $state(true);
  let loadingFolders = $state(true);

  // Pagination
  let currentPage = $state(1);
  let totalPages = $state(1);
  const limit = 6;

  // Folder Filter State
  let selectedFolderId = $state<number | null>(null);

  // Upload State
  let label = $state("");
  let selectedFiles = $state<File[]>([]);
  let uploadFolderId = $state<string>("");
  let uploading = $state(false);
  let uploadProgress = $state(0);
  let uploadError = $state("");
  let uploadSuccess = $state("");

  // Folder Creation State
  let newFolderName = $state("");
  let creatingFolder = $state(false);
  let folderError = $state("");

  // Delete Modals
  let showDeleteModal = $state(false);
  let itemToDelete = $state<any | null>(null);
  let deleting = $state(false);

  let showDeleteFolderModal = $state(false);
  let folderToDelete = $state<any | null>(null);
  let deletingFolder = $state(false);

  let searchQuery = $state("");
  let sortBy = $state<"newest" | "oldest" | "az" | "za">("newest");
  let searchDebounce: ReturnType<typeof setTimeout>;

  onMount(async () => {
    await Promise.all([fetchFolders(), fetchMateri(1)]);
  });

  async function fetchFolders() {
    loadingFolders = true;
    const res = await getAllFolders();
    if (res.success && res.data) folderList = res.data;
    loadingFolders = false;
  }

  async function fetchMateri(page: number) {
    loadingData = true;
    const res = await getAllMateri(page, limit, selectedFolderId, searchQuery, sortBy);
    if (res.success && res.data) {
      materiList = res.data;
      totalPages = res.meta?.totalPages || 1;
    }
    loadingData = false;
  }

  function handleSearchInput() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      currentPage = 1;
      await fetchMateri(1);
    }, 400);
  }

  async function handleSortChange() {
    currentPage = 1;
    await fetchMateri(1);
  }

  async function selectFolder(id: number | null) {
    selectedFolderId = id;
    currentPage = 1;
    await fetchMateri(1);
  }

  async function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    await fetchMateri(newPage);
  }

  async function handleCreateFolder(e: Event) {
    e.preventDefault();
    if (!newFolderName) return;
    folderError = "";
    creatingFolder = true;
    const res = await createFolder(newFolderName);
    if (res.success) {
      newFolderName = "";
      await fetchFolders();
    } else {
      folderError = res.message || "Failed to create folder";
    }
    creatingFolder = false;
  }

  function openDeleteFolderModal(folder: any) {
    folderToDelete = folder;
    showDeleteFolderModal = true;
  }

  async function confirmDeleteFolder() {
    if (!folderToDelete) return;
    deletingFolder = true;
    const res = await deleteFolder(folderToDelete.id);
    if (res.success) {
      showDeleteFolderModal = false;
      if (selectedFolderId === folderToDelete.id) selectFolder(null);
      else await Promise.all([fetchFolders(), fetchMateri(currentPage)]);
    }
    deletingFolder = false;
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      selectedFiles = Array.from(target.files);
    }
  }

  async function handleUpload(e: Event) {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    uploading = true;
    uploadError = "";
    uploadSuccess = "";
    uploadProgress = 0;

    let failed = 0;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Use shared label if provided, otherwise use filename without extension
      const fileLabel = label.trim() || file.name.replace(/\.[^/.]+$/, "");

      const folderName = folderList.find((f) => f.id === +uploadFolderId)?.name;
      const res = await uploadMateri(fileLabel, file, uploadFolderId ? +uploadFolderId : null, folderName || null);
      if (!res.success) failed++;
      uploadProgress = Math.round(((i + 1) / selectedFiles.length) * 100);
    }

    if (failed === 0) {
      uploadSuccess = `${selectedFiles.length} video(s) uploaded successfully!`;
    } else if (failed < selectedFiles.length) {
      uploadSuccess = `${selectedFiles.length - failed} uploaded, ${failed} failed.`;
    } else {
      uploadError = "All uploads failed.";
    }

    label = "";
    selectedFiles = [];
    uploadFolderId = "";
    const fileInput = document.getElementById("videoInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    currentPage = 1;
    await fetchMateri(1);
    uploading = false;
  }

  function openDeleteModal(item: any) {
    itemToDelete = item;
    showDeleteModal = true;
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    deleting = true;
    const res = await deleteMateri(itemToDelete.id);
    if (res.success) {
      showDeleteModal = false;
      if (materiList.length === 1 && currentPage > 1) currentPage--;
      await fetchMateri(currentPage);
    }
    deleting = false;
  }

  const videoUrl = (path: string) => `${API}${path}`;
  const pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));
</script>

<div class="w-full py-5 px-10">
  <h1 class="text-3xl font-bold text-white mb-8">Materi Management</h1>

  <!-- FOLDER CREATION -->
  <form onsubmit={handleCreateFolder} class="flex gap-3 mb-6">
    <div class="flex flex-col">
      <input
        type="text"
        bind:value={newFolderName}
        placeholder="New Folder Name"
        required
        class="flex-1 max-w-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
      />{#if folderError}
        <p class="text-red-400 text-sm">{folderError}</p>
      {/if}
    </div>
    <button type="submit" disabled={creatingFolder} class="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 flex items-center gap-2 disabled:opacity-50">
      <FolderPlus class="w-4 h-4" />
      {creatingFolder ? "Creating..." : "Create Folder"}
    </button>
  </form>

  <!-- FOLDER TABS -->
  <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
    <button onclick={() => selectFolder(null)} class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors {selectedFolderId === null ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}">
      All Videos
    </button>
    {#each folderList as folder}
      <div
        role="button"
        tabindex="0"
        onclick={() => selectFolder(folder.id)}
        onkeydown={(e) => e.key === "Enter" && selectFolder(folder.id)}
        class="group px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer
        {selectedFolderId === folder.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}"
      >
        <Folder class="w-4 h-4" />
        {folder.name}
        <button
          onclick={(e) => {
            e.stopPropagation();
            openDeleteFolderModal(folder);
          }}
          class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    {/each}
  </div>

  <!-- UPLOAD FORM -->
  <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
    <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <FileUp class="w-5 h-5" /> Upload New Video(s)
    </h2>
    <form onsubmit={handleUpload} class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" bind:value={label} placeholder="Shared title (optional for bulk)" class="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500" />
        <select bind:value={uploadFolderId} class="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" class="bg-slate-800">No Folder (Root)</option>
          {#each folderList as folder}
            <option value={folder.id} class="bg-slate-800">{folder.name}</option>
          {/each}
        </select>

        <input
          id="videoInput"
          type="file"
          accept="video/*"
          multiple
          onchange={handleFileChange}
          required
          class="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer text-slate-400"
        />
      </div>

      <!-- Selected files list -->
      {#if selectedFiles.length > 0}
        <p class="text-xs text-slate-400">
          {#if label.trim()}
            {selectedFiles.length} file(s) — all saved as "<span class="text-white">{label}</span>"
          {:else}
            {selectedFiles.length} file(s) — each saved using its own filename
          {/if}
        </p>
      {/if}

      <!-- Progress bar -->
      {#if uploading}
        <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: {uploadProgress}%"></div>
        </div>
        <p class="text-xs text-slate-400 text-center">{uploadProgress}% — uploading {selectedFiles.length} file(s)...</p>
      {/if}

      {#if uploadError}
        <div class="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm border border-red-500/50">{uploadError}</div>
      {/if}
      {#if uploadSuccess}
        <div class="bg-emerald-500/20 text-emerald-300 px-4 py-3 rounded-lg text-sm border border-emerald-500/50">{uploadSuccess}</div>
      {/if}

      <button type="submit" disabled={uploading || selectedFiles.length === 0} class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400/50">
        {uploading ? `Uploading... (${uploadProgress}%)` : `Save ${selectedFiles.length > 1 ? `${selectedFiles.length} Videos` : "Materi"}`}
      </button>
    </form>
  </div>

  <!-- SEARCH & SORT BAR -->
  <div class="flex flex-col sm:flex-row gap-3 mb-6">
    <div class="relative flex-1">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        oninput={handleSearchInput}
        placeholder="Search by title..."
        class="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {#if searchQuery}
        <button
          onclick={() => {
            searchQuery = "";
            currentPage = 1;
            fetchMateri(1);
          }}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X class="w-4 h-4" />
        </button>
      {/if}
    </div>

    <select bind:value={sortBy} onchange={handleSortChange} class="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48">
      <option value="newest" class="bg-slate-800">Newest First</option>
      <option value="oldest" class="bg-slate-800">Oldest First</option>
      <option value="az" class="bg-slate-800">Title A → Z</option>
      <option value="za" class="bg-slate-800">Title Z → A</option>
    </select>
  </div>

  <!-- MATERI GRID -->
  {#if loadingData}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {#each Array(limit) as _}
        <div class="bg-white/10 rounded-2xl border border-white/10 animate-pulse h-80"></div>
      {/each}
    </div>
  {:else if materiList.length === 0}
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-10 text-center text-slate-400">
      No materi found in {#if selectedFolderId}this folder{:else}root{/if}.
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {#each materiList as item (item.id)}
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-white/20 transition-colors">
          <div class="relative aspect-video bg-black">
            <video controls class="w-full h-full" preload="metadata">
              <source src={videoUrl(item.path)} type="video/mp4" />
            </video>
          </div>
          <div class="p-4 flex justify-between items-center mt-auto border-t border-white/10">
            <div class="mr-4 min-w-0">
              <h3 class="text-white font-semibold truncate">{item.label}</h3>
              <p class="text-slate-500 text-xs mt-0.5">
                {#if item.folder}📁 {item.folder.name} •
                {/if}{new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onclick={() => openDeleteModal(item)} class="text-red-400 hover:text-red-300 shrink-0 p-1 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- PAGINATION -->
    {#if totalPages > 1}
      <div class="flex justify-center items-center gap-2 mt-6">
        <button aria-label="Previous page" onclick={() => changePage(currentPage - 1)} disabled={currentPage === 1} class="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {#each pages as p}
          <button onclick={() => changePage(p)} class="w-10 h-10 rounded-lg font-medium transition-colors {p === currentPage ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-slate-300 hover:bg-white/20'}">
            {p}
          </button>
        {/each}
        <button aria-label="Next page" onclick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} class="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    {/if}
  {/if}
</div>

<!-- DELETE VIDEO MODAL -->
{#if showDeleteModal && itemToDelete}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label="Delete video"
    onclick={() => (showDeleteModal = false)}
    onkeydown={(e) => e.key === "Escape" && (showDeleteModal = false)}
  >
    <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl" role="document">
      <h3 class="text-xl font-bold text-white mb-2">Delete Video</h3>
      <p class="text-slate-400 mb-6">Delete "<span class="text-white font-semibold">{itemToDelete.label}</span>"?</p>
      <div class="flex justify-end gap-3">
        <button type="button" onclick={() => (showDeleteModal = false)} class="px-5 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600">Cancel</button>
        <button type="button" onclick={confirmDelete} disabled={deleting} class="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-red-400/50">{deleting ? "Deleting..." : "Yes"}</button>
      </div>
    </div>
  </div>
{/if}

<!-- DELETE FOLDER MODAL -->
{#if showDeleteFolderModal && folderToDelete}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label="Delete folder"
    onclick={() => (showDeleteFolderModal = false)}
    onkeydown={(e) => e.key === "Escape" && (showDeleteFolderModal = false)}
  >
    <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl" role="document">
      <h3 class="text-xl font-bold text-white mb-2 text-red-400">Delete Folder</h3>
      <p class="text-slate-400 mb-6">Are you sure? This will permanently delete the folder "<span class="text-white font-semibold">{folderToDelete.name}</span>" and <span class="text-red-400 font-semibold">ALL VIDEOS INSIDE IT</span>.</p>
      <div class="flex justify-end gap-3">
        <button type="button" onclick={() => (showDeleteFolderModal = false)} class="px-5 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600">Cancel</button>
        <button type="button" onclick={confirmDeleteFolder} disabled={deletingFolder} class="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-red-400/50"
          >{deletingFolder ? "Deleting..." : "Yes, Delete All"}</button
        >
      </div>
    </div>
  </div>
{/if}
