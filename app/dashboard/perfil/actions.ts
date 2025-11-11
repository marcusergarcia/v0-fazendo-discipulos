"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function atualizarFotoPerfil(file: File) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  // Upload para Supabase Storage
  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

  if (uploadError) throw uploadError

  // Obter URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from("profiles").getPublicUrl(filePath)

  // Atualizar profile
  const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

  if (updateError) throw updateError

  revalidatePath("/dashboard/perfil")
  revalidatePath("/dashboard")

  return { success: true }
}
