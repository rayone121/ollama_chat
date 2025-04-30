<script lang="ts">
    import { onMount } from "svelte";
    import { model } from "$lib/stores/modelStore";
    import { marked } from "marked";
    import axios from "axios";

    let userInput = "";
    let messages: { role: string; content: string }[] = [];

    async function sendMessage() {
        if (!userInput.trim()) return;

        // Add user message
        messages = [...messages, { role: "user", content: userInput }];

        const currentModel = $model;

        try {
            const res = await axios.post("http://localhost:11434/api/chat", {
                model: currentModel,
                messages,
            });

            const reply = res.data.message.content;

            // Add assistant message
            messages = [...messages, { role: "assistant", content: reply }];
        } catch (err) {
            console.error("Error talking to Ollama:", err);
            messages = [
                ...messages,
                { role: "assistant", content: "_Error contacting model_" },
            ];
        }

        userInput = "";
    }
</script>

<div class="max-w-3xl mx-auto p-4 space-y-4">
    {#each messages as msg}
        <div
            class="{msg.role === 'user'
                ? 'text-right'
                : 'text-left'} bg-gray-100 p-3 rounded shadow"
        >
            <div class="prose prose-sm max-w-full inline-block text-left">
                {@html marked(msg.content)}
            </div>
        </div>
    {/each}

    <div class="flex gap-2 mt-4">
        <input
            bind:value={userInput}
            class="w-full p-2 border rounded"
            placeholder="Ask something..."
            on:keydown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
            on:click={sendMessage}
            class="bg-blue-500 text-white px-4 py-2 rounded"
        >
            Send
        </button>
    </div>
</div>
