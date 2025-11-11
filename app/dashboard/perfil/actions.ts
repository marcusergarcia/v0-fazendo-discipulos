"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function atualizarPerfil(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  const nome_completo = formData.get("nome_completo") as string
  const telefone = formData.get("telefone") as string
  const igreja = formData.get("igreja") as string
  const bio = formData.get("bio") as string

  const { error } = await supabase
    .from("profiles")
    .update({
      nome_completo,
      telefone,
      igreja,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/perfil")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function uploadFotoPerfil(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  const file = formData.get("file") as File

  if (!file) {
    return { success: false, error: "Nenhum arquivo enviado" }
  }

  // Criar nome único para o arquivo
  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  // Upload para Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (uploadError) {
    console.error("Erro ao fazer upload:", uploadError)
    return { success: false, error: uploadError.message }
  }

  // Obter URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath)

  // Atualizar perfil com nova URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      foto_perfil_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    console.error("Erro ao atualizar perfil:", updateError)
    return { success: false, error: updateError.message }
  }

  revalidatePath("/dashboard/perfil")
  revalidatePath("/dashboard")

  return { success: true, url: publicUrl }
}
