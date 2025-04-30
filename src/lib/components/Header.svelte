<script>
    import { page } from "$app/stores";
</script>

<nav
    class="bg-gray-800 text-white px-6 py-4 shadow-md flex items-center justify-between"
>
    <a href="/" class="text-lg font-semibold hover:underline">
        💬 ChatGPT Clone
    </a>
    <div>
        <a
            href="/settings"
            class="text-sm hover:text-gray-300 underline"
            class:selected={$page.url.pathname === "/settings"}
        >
            Settings ⚙️
        </a>
    </div>
</nav>
