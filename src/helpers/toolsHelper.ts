import Swal from "sweetalert2";

export const showSuccessDialog = (text: string) => Swal.fire({ icon: "success", title: "Berhasil", text, confirmButtonColor: "#b3402a" });

export const showErrorDialog = (text: string) => Swal.fire({ icon: "error", title: "Gagal", text, confirmButtonColor: "#b3402a" });

export async function showConfirmDialog(text: string): Promise<boolean> {
  const r = await Swal.fire({
    icon: "warning",
    title: "Yakin?",
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: "#b3402a",
  });
  return r.isConfirmed;
}