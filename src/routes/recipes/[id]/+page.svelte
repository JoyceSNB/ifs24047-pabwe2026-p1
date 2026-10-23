<script lang="ts">
  import { page } from "$app/state";
  import DetailPage from "../../../features/recipes/pages/DetailPage.svelte";
</script>

<DetailPage id={page.params.id} />
