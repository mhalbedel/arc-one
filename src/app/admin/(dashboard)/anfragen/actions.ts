'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { InquiryStatus } from '@/types'

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_inquiries')
    .update({ status } as never)
    .eq('id', id)
    .select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Anfrage nicht gefunden.' }
  revalidatePath('/admin/anfragen')
  return {}
}
