<script lang="ts">
    import { onMount } from "svelte";
    import { model, setModel } from "$lib/stores/modelStore";
    import { get } from "svelte/store";
    import axios from "axios";

    let models: string[] = [];
    let selectedModel = get(model);

    let newModel = "";
    let loading = false;
    let error = "";

    onMount(loadModels);

    async function loadModels() {
        try {
            const res = await axios.get("http://localhost:11434/api/tags");
            models = res.data.models.map((m: any) => m.name);
        } catch (e) {
            error = "Failed to load models";
            console.error(e);
        }
    }

    function handleChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value;
        selectedModel = value;
        setModel(value);
    }

    async function pullModel() {
        if (!newModel.trim()) return;

        loading = true;
        error = "";
        try {
            await axios.post("http://localhost:11434/api/pull", {
                name: newModel.trim(),
            });
            await loadModels();
            setModel(newModel.trim());
            selectedModel = newModel.trim();
            newModel = "";
        } catch (err) {
            error = "Failed to pull model. Check name or try again.";
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Settings</h1>

    <!-- Select Existing Model -->
    <div>
        <label class="block text-sm font-medium mb-2">Select Model</label>
        <select
            bind:value={selectedModel}
            on:change={handleChange}
            class="w-full p-2 border rounded"
        >
            {#each models as m}
                <option value={m}>{m}</option>
            {/each}
        </select>
    </div>

    <!-- Pull New Model -->
    <div class="pt-4 border-t">
        <label class="block text-sm font-medium mb-2"
            >Download New Model (e.g. llama2)</label
        >
        <div class="flex gap-2">
            <input
                bind:value={newModel}
                class="flex-grow p-2 border rounded"
                placeholder="model name..."
            />
            <button
                on:click={pullModel}
                class="bg-green-600 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Downloading..." : "Add"}
            </button>
        </div>
        {#if error}
            <p class="text-red-600 text-sm mt-2">{error}</p>
        {/if}
    </div>
</div>
