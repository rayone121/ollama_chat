<script lang="ts">
    import { onMount } from "svelte";
    import { model } from "$lib/stores/modelStore";
    import { marked } from "marked";
    import axios from "axios";

    let userInput = "";
    let messages: { role: string; content: string }[] = [];
    let isLoading = false;

    async function sendMessage() {
        if (!userInput.trim()) return;

        // Add user message
        messages = [...messages, { role: "user", content: userInput }];
        
        // Add an empty assistant message for streaming into
        let assistantMessageIndex = messages.length;
        messages = [...messages, { role: "assistant", content: "" }];
        
        const currentModel = $model;
        isLoading = true;

        try {
            // Use fetch instead of axios for stream handling
            const response = await fetch("http://localhost:11434/api/chat", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: currentModel,
                    messages: messages.slice(0, -1), // Exclude the empty assistant message
                }),
            });

            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        
                        // Skip <think> tags from some models like Qwen
                        if (data.message?.content === "<think>" || 
                            data.message?.content === "</think>") {
                            continue;
                        }
                        
                        // Append content chunk
                        if (data.message?.content) {
                            fullContent += data.message.content;
                            // Update the assistant message with accumulated content
                            messages[assistantMessageIndex].content = fullContent;
                            messages = [...messages]; // Force Svelte reactivity
                        }
                    } catch (e) {
                        console.error("Error parsing JSON chunk:", e, line);
                    }
                }
            }
        } catch (err) {
            console.error("Error talking to Ollama:", err);
            messages[assistantMessageIndex].content = "_Error contacting model_";
            messages = [...messages]; // Force Svelte reactivity
        } finally {
            isLoading = false;
            userInput = "";
        }
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
            on:keydown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
            disabled={isLoading}
        />
        <button
            on:click={sendMessage}
            class="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={isLoading}
        >
            {isLoading ? 'Thinking...' : 'Send'}
        </button>
    </div>
</div>