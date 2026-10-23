import { goto } from "$app/navigation";
import { logout } from "../states/authStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

/** Meminta konfirmasi lalu keluar dari akun. Mengembalikan true bila benar-benar keluar. */
export async function confirmSignOut(): Promise<boolean> {
  if (!(await showConfirmDialog("Yakin ingin keluar dari akun ini?"))) return false;
  logout();
  goto("/auth/login");
  return true;
}
