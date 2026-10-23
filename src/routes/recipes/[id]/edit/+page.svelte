<script lang="ts">
  import { page } from "$app/state";
  import FormPage from "../../../../features/recipes/pages/FormPage.svelte";
</script>

<FormPage id={page.params.id} />
