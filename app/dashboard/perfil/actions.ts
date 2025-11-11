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

  // Validar tamanho (máximo 5MB)
  if (file.size > 5242880) {
    return { success: false, error: "Arquivo muito grande. Máximo 5MB." }
  }

  // Validar tipo de arquivo
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Tipo de arquivo não permitido. Use PNG, JPG, GIF ou WebP." }
  }

  try {
    // Converter para base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Atualizar perfil com nova foto em base64
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        foto_perfil_url: dataUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath("/dashboard/perfil")
    revalidatePath("/dashboard")

    return { success: true, url: dataUrl }
  } catch (error) {
    console.error("Erro ao processar arquivo:", error)
    return { success: false, error: "Erro ao processar arquivo" }
  }
}
