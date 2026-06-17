<script lang="ts">
  import type { AIModel } from "$lib/types";
  import { onMount } from "svelte";
  import { uploadModel, getAllModels, updateModel, activateModel, deleteModel } from "$lib/admin/aiModels";

  let name = $state("");
  let version = $state("");
  // let inputWidth = $state(320);
  // let inputHeight = $state(320);
  // let normalizeMean = $state(127.5);
  // let normalizeStd = $state(127.5);
  // let scoreThreshold = $state(0.5);
  let isActive = $state(true);

  let modelFile: File | null = null;
  let labelsFile: File | null = null;

  let loading = $state(false);
  let success = $state("");

  let editingModel = $state<AIModel | null>(null);
  let editLoading = $state(false);

  let models = $state<AIModel[]>([]);

  async function fetchModels() {
    const res = await getAllModels();

    // console.log("fetchModels result:", res);

    if (res.success) {
      models = res.data;
      // console.log("models state:", models);
    }
  }

  async function handleUpload() {
    if (!name.trim()) {
      success = "Model name is required";
      return;
    }

    if (!version.trim()) {
      success = "Version is required";
      return;
    }

    if (!modelFile) {
      success = "Please upload a .tflite model";
      return;
    }

    if (!labelsFile) {
      success = "Please upload labels file";
      return;
    }

    loading = true;
    success = "";

    // const res = await uploadModel(name, version, inputWidth, inputHeight, normalizeMean, normalizeStd, scoreThreshold, isActive, modelFile, labelsFile);
    const res = await uploadModel(name, version, isActive, modelFile, labelsFile);

    loading = false;

    if (res.success) {
      success = "Model uploaded successfully";

      name = "";
      version = "";

      modelFile = null;
      labelsFile = null;

      await fetchModels();
    } else {
      success = res.message ?? "Upload failed";
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete model?")) return;

    loading = true;

    const res = await deleteModel(id);

    loading = false;

    if (res.success) {
      success = "Model deleted successfully";
      await fetchModels();
    } else {
      success = res.message ?? "Failed to delete model";
    }
  }

  async function handleActivate(id: number) {
    loading = true;

    const res = await activateModel(id);

    loading = false;

    if (res.success) {
      success = "Model activated successfully";
      await fetchModels();
    } else {
      success = res.message ?? "Failed to activate model";
    }
  }

  function handleEdit(model: AIModel) {
    editingModel = {
      id: model.id,
      name: model.name,
      version: model.version,
      // inputWidth: model.inputWidth,
      // inputHeight: model.inputHeight,
      // normalizeMean: model.normalizeMean,
      // normalizeStd: model.normalizeStd,
      // scoreThreshold: model.scoreThreshold,
      isActive: model.isActive,
      modelPath: model.modelPath,
      labelsPath: model.labelsPath,
      createdAt: model.createdAt,
    };
  }

  async function handleEditSave() {
    if (!editingModel) return;

    editLoading = true;

    // console.log(editingModel.normalizeMean);
    // console.log(typeof editingModel.normalizeMean);

    const res = await updateModel(editingModel.id, {
      name: editingModel.name,
      version: editingModel.version,
      // inputWidth: editingModel.inputWidth,
      // inputHeight: editingModel.inputHeight,
      // normalizeMean: editingModel.normalizeMean,
      // normalizeStd: editingModel.normalizeStd,
      // scoreThreshold: editingModel.scoreThreshold,
      isActive: editingModel.isActive,
    });

    editLoading = false;

    if (res.success) {
      success = "Model updated successfully";
      editingModel = null;
      await fetchModels();
    } else {
      success = res.message ?? "Failed to update model";
    }
  }

  onMount(fetchModels);
</script>

<div class="w-full py-5 px-10">
  <div class="flex justify-between items-center mb-12">
    <h1 class="text-3xl font-bold text-white">AI Model Manager</h1>
  </div>

  <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="model_name" class="text-sm text-slate-300 block mb-2"> Model Name </label>

        <input id="model_name" bind:value={name} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Fruit Detector" />
      </div>

      <div>
        <label for="version" class="text-sm text-slate-300 block mb-2"> Version </label>

        <input id="version" bind:value={version} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="v1" />
      </div>

      <!-- <div>
        <label for="inputWidth" class="text-sm text-slate-300 block mb-2"> Input Width </label>

        <input type="number" bind:value={inputWidth} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
      </div> -->

      <!-- <div>
        <label for="inputHeight" class="text-sm text-slate-300 block mb-2"> Input Height </label>

        <input type="number" bind:value={inputHeight} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
      </div> -->

      <!-- <div>
        <label for="normalizeMean" class="text-sm text-slate-300 block mb-2"> Normalize Mean </label>

        <input type="number" step="0.1" bind:value={normalizeMean} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
      </div> -->

      <!-- <div>
        <label for="normalizeStd" class="text-sm text-slate-300 block mb-2"> Normalize Std </label>

        <input type="number" step="0.1" bind:value={normalizeStd} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
      </div>

      <div>
        <label for="scoreThreshold" class="text-sm text-slate-300 block mb-2"> Score Threshold </label>

        <input type="number" step="0.1" bind:value={scoreThreshold} class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
      </div> -->

      <div class="flex items-center gap-3 mt-8">
        <input type="checkbox" bind:checked={isActive} />

        <span class="text-white"> Set Active Model </span>
      </div>
    </div>

    <div class="mt-6">
      <label for="labels" class="text-sm text-slate-300 block mb-2"> Upload Labels (.txt) </label>

      <input
        type="file"
        accept=".txt"
        onchange={(e) => {
          labelsFile = e.currentTarget.files?.[0] ?? null;
        }}
        class="text-white"
      />
    </div>

    <div class="mt-6">
      <label for="models" class="text-sm text-slate-300 block mb-2"> Upload Model (.tflite) </label>

      <input
        type="file"
        accept=".tflite"
        onchange={(e) => {
          modelFile = e.currentTarget.files?.[0] ?? null;
        }}
        class="text-white"
      />
    </div>

    <button onclick={handleUpload} disabled={loading} class="mt-10 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all rounded-xl px-6 py-3 font-semibold text-black">
      {#if loading}
        Uploading...
      {:else}
        Upload Model
      {/if}
    </button>

    {#if success}
      <p class="mt-4 text-slate-300">
        {success}
      </p>
    {/if}
  </div>
</div>
<div class="mt-10 mx-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl">
  <h2 class="text-2xl font-bold text-white mb-6">Uploaded Models</h2>

  <div class="overflow-x-auto">
    <table class="w-full text-left">
      <thead>
        <tr class="border-b border-white/10 text-slate-400">
          <th class="py-4">Name</th>
          <th>Version</th>
          <th>Input</th>
          <th>Status</th>
          <th class="text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {#each models as model}
          <tr class="border-b border-white/5">
            <td class="py-5 text-white">
              {model.name}
            </td>

            <td class="text-slate-300">
              {model.version}
            </td>

            <!-- <td class="text-slate-300">
              {model.inputWidth}x{model.inputHeight}
            </td> -->

            <td>
              <div class="flex justify-end gap-3">
                {#if !model.isActive}
                  <button onclick={() => handleActivate(model.id)} class="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm text-white"> Activate </button>
                {/if}

                <button onclick={() => handleEdit(model)} class="bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg text-sm text-black"> Edit </button>

                <button onclick={() => handleDelete(model.id)} class="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-lg text-sm text-white"> Delete </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if editingModel}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xl">
        <h2 class="text-2xl font-bold text-white mb-6">Edit Model</h2>

        <div class="space-y-4">
          <input bind:value={editingModel.name} class="w-full px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" placeholder="Model Name" />

          <input bind:value={editingModel.version} class="w-full px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" placeholder="Version" />

          <!-- <div class="grid grid-cols-2 gap-4">
            <input type="number" bind:value={editingModel.inputWidth} class="px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" />

            <input type="number" bind:value={editingModel.inputHeight} class="px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <input type="number" step="0.1" bind:value={editingModel.normalizeMean} class="px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" />

            <input type="number" step="0.1" bind:value={editingModel.normalizeStd} class="px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" />
          </div>

          <input type="number" step="0.1" bind:value={editingModel.scoreThreshold} class="w-full px-4 py-3 rounded-xl bg-black/20 text-white border border-slate-700" /> -->

          <label class="flex items-center gap-3 text-white">
            <input type="checkbox" bind:checked={editingModel.isActive} />
            Active
          </label>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button onclick={() => (editingModel = null)} class="px-5 py-3 rounded-xl bg-slate-700 text-white"> Cancel </button>

          <button onclick={handleEditSave} disabled={editLoading} class="px-5 py-3 rounded-xl bg-emerald-500 text-black font-semibold">
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
