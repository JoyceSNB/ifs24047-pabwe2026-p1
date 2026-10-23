<script lang="ts">
  import { fieldClass } from "../../../helpers/styles";
  import { goto } from "$app/navigation";
  import { login, register } from "../states/authStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  let { mode }: { mode: "login" | "register" } = $props();

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let busy = $state(false);
  const isRegister = $derived(mode === "register");

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    busy = true;
    const r = isRegister ? await register({ name, email, password }) : await login({ email, password });
    busy = false;
    if (!r.ok) return showErrorDialog(r.message);
    goto("/");
  }
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-10">
  <div class="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 shadow-sm">
    <img src="/logo.png" alt="" class="mx-auto h-24 w-auto" />
    <p class="mt-2 text-center font-display text-xl font-bold text-chili">Koleksi Resep</p>
    <h1 class="mt-5 text-center text-2xl font-bold">{isRegister ? "Daftar" : "Masuk"}</h1>
    <p class="mb-5 mt-1 text-center text-sm text-muted">
      {isRegister ? "Buat akun untuk menyimpan resepmu." : "Masuk untuk melihat dan mengelola resep."}
    </p>
    <form onsubmit={submit} class="space-y-4">
      {#if isRegister}
        <label class="block text-sm font-medium">Nama
          <input bind:value={name} required maxlength="60" class={fieldClass} />
        </label>
      {/if}
      <label class="block text-sm font-medium">Email
        <input bind:value={email} type="email" required class={fieldClass} />
      </label>
      <label class="block text-sm font-medium">Password
        <input bind:value={password} type="password" required minlength="6" class={fieldClass} />
      </label>
      <button type="submit" disabled={busy} class="w-full rounded-lg bg-chili px-5 py-2 font-medium text-white disabled:opacity-60">
        {busy ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
      </button>
    </form>
    <p class="mt-5 text-center text-sm text-muted">
      {#if isRegister}
        Sudah punya akun? <a href="/auth/login" class="text-chili underline">Masuk</a>
      {:else}
        Belum punya akun? <a href="/auth/register" class="text-chili underline">Daftar</a>
      {/if}
    </p>
  </div>
</div>
