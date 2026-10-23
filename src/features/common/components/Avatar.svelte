<script lang="ts">
  import { fileUrl } from "../../../helpers/apiHelper";

  let { user, size = "sm" }: { user: User; size?: "sm" | "lg" } = $props();

  const box = $derived(size === "lg" ? "h-16 w-16 text-3xl" : "h-7 w-7 text-sm");
</script>

{#if user.avatar_url}
  <img src={fileUrl(user.avatar_url)} alt={`Foto profil ${user.name}`} class={`shrink-0 rounded-full object-cover ${box}`} />
{:else}
  <span class={`flex shrink-0 items-center justify-center rounded-full bg-turmeric/30 font-bold text-turmeric ${box}`} aria-hidden="true">
    {user.name.charAt(0).toUpperCase()}
  </span>
{/if}