// src/lib/supabase.js
// =============================================
// NEXUS — Supabase client va helper funksiyalar
// =============================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =============================================
// AUTH
// =============================================
export const auth = {
  // Ro'yxatdan o'tish
  signUp: async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    })
    if (error) throw error
    return data
  },

  // Kirish
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  // Chiqish
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Joriy foydalanuvchi
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Parol tiklash
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }
}

// =============================================
// PROFIL
// =============================================
export const profiles = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Telefon yoki nexus_id orqali qidirish
  search: async (query) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, nexus_id, avatar_url')
      .or(`phone.ilike.%${query}%,nexus_id.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)
    if (error) throw error
    return data
  }
}

// =============================================
// GAP
// =============================================
export const gap = {
  // Guruhlar ro'yxati
  getGroups: async (userId) => {
    const { data, error } = await supabase
      .from('gap_groups')
      .select(`
        *,
        gap_members!inner(user_id, turn_number, has_received),
        profiles!gap_groups_created_by_fkey(full_name)
      `)
      .eq('gap_members.user_id', userId)
    if (error) throw error
    return data
  },

  // Yangi guruh yaratish
  createGroup: async ({ name, monthlyAmount, turnOrder, createdBy }) => {
    const { data, error } = await supabase
      .from('gap_groups')
      .insert({ name, monthly_amount: monthlyAmount, turn_order: turnOrder, created_by: createdBy })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // A'zo qo'shish
  addMember: async (groupId, userId, turnNumber) => {
    const { data, error } = await supabase
      .from('gap_members')
      .insert({ group_id: groupId, user_id: userId, turn_number: turnNumber })
      .select()
      .single()
    if (error) throw error

    // Jami a'zolar sonini yangilash
    await supabase.rpc('increment_group_members', { group_id: groupId })
    return data
  },

  // A'zolar ro'yxati
  getMembers: async (groupId) => {
    const { data, error } = await supabase
      .from('gap_members')
      .select(`*, profiles(full_name, nexus_id, avatar_url)`)
      .eq('group_id', groupId)
      .order('turn_number')
    if (error) throw error
    return data
  },

  // To'lov qo'shish
  addPayment: async ({ groupId, fromUser, toUser, amount, monthYear, method }) => {
    const { data, error } = await supabase
      .from('gap_payments')
      .insert({
        group_id: groupId,
        from_user: fromUser,
        to_user: toUser,
        amount,
        month_year: monthYear,
        payment_method: method,
        status: 'confirmed',
        paid_at: new Date().toISOString()
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Oylik to'lovlar holati
  getMonthlyPayments: async (groupId, monthYear) => {
    const { data, error } = await supabase
      .from('gap_payments')
      .select(`*, profiles!gap_payments_from_user_fkey(full_name)`)
      .eq('group_id', groupId)
      .eq('month_year', monthYear)
    if (error) throw error
    return data
  }
}

// =============================================
// TO'YONA
// =============================================
export const toyona = {
  // Tadbir yaratish
  createEvent: async ({ createdBy, ownerName, eventType, eventDate, targetAmount, description }) => {
    const { data, error } = await supabase
      .from('toyona_events')
      .insert({ created_by: createdBy, owner_name: ownerName, event_type: eventType, event_date: eventDate, target_amount: targetAmount, description })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Link orqali tadbirni olish
  getByLink: async (shareLink) => {
    const { data, error } = await supabase
      .from('toyona_events')
      .select('*')
      .eq('share_link', shareLink)
      .single()
    if (error) throw error
    return data
  },

  // Foydalanuvchi tadbirlari
  getUserEvents: async (userId) => {
    const { data, error } = await supabase
      .from('toyona_events')
      .select('*')
      .eq('created_by', userId)
      .order('event_date', { ascending: true })
    if (error) throw error
    return data
  },

  // Daftarga yozuv qo'shish
  addEntry: async ({ eventId, recordedBy, guestName, amount, note }) => {
    const { data, error } = await supabase
      .from('toyona_entries')
      .insert({ event_id: eventId, recorded_by: recordedBy, guest_name: guestName, amount, note })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Tadbir yozuvlari
  getEntries: async (eventId) => {
    const { data, error } = await supabase
      .from('toyona_entries')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // To'yona tarixi (inflyatsiya uchun)
  getHistory: async (userId) => {
    const { data, error } = await supabase
      .from('toyona_history')
      .select(`*, toyona_events(event_type, owner_name)`)
      .eq('from_user', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Inflyatsiya hisoblash
  calculateInflation: (originalAmount, year, relationCoeff = 1.0) => {
    const inflationRates = {
      2019: 0.89, 2020: 0.61, 2021: 0.52,
      2022: 0.42, 2023: 0.28, 2024: 0.10, 2025: 0.0
    }
    const totalInflation = Object.entries(inflationRates)
      .filter(([y]) => parseInt(y) >= year)
      .reduce((acc, [, rate]) => acc * (1 + rate), 1) - 1

    const inflatedAmount = originalAmount * (1 + totalInflation)
    const recommended = Math.round(inflatedAmount * relationCoeff / 50000) * 50000
    return {
      originalAmount,
      totalInflationPct: Math.round(totalInflation * 100),
      inflatedAmount: Math.round(inflatedAmount),
      recommended,
      yearsAgo: new Date().getFullYear() - year
    }
  }
}

// =============================================
// TRANZAKSIYALAR
// =============================================
export const transactions = {
  // So'nggi tranzaksiyalar
  getRecent: async (userId, limit = 20) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        from_profile:profiles!transactions_from_user_fkey(full_name, nexus_id),
        to_profile:profiles!transactions_to_user_fkey(full_name, nexus_id)
      `)
      .or(`from_user.eq.${userId},to_user.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  // Pul yuborish
  send: async ({ fromUser, toUser, amount, description, type = 'transfer' }) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ from_user: fromUser, to_user: toUser, amount, description, type })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Oylik statistika
  getMonthlyStats: async (userId, monthYear) => {
    const [year, month] = monthYear.split('-')
    const startDate = `${year}-${month}-01`
    const endDate = `${year}-${month}-31`

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_user.eq.${userId},to_user.eq.${userId}`)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
    if (error) throw error

    const income = data.filter(t => t.to_user === userId).reduce((s, t) => s + t.amount, 0)
    const expense = data.filter(t => t.from_user === userId).reduce((s, t) => s + t.amount, 0)

    // Kategoriyalar
    const categories = {}
    data.filter(t => t.from_user === userId).forEach(t => {
      const cat = t.category || 'boshqa'
      categories[cat] = (categories[cat] || 0) + t.amount
    })

    return { income, expense, saved: income - expense, categories, transactions: data }
  }
}

// =============================================
// TEJAMKORLIK MAQSADLARI
// =============================================
export const goals = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  create: async ({ userId, name, emoji, targetAmount, deadline }) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ user_id: userId, name, emoji, target_amount: targetAmount, deadline })
      .select()
      .single()
    if (error) throw error
    return data
  },

  addAmount: async (goalId, amount) => {
    const { data, error } = await supabase.rpc('increment_goal_amount', { goal_id: goalId, add_amount: amount })
    if (error) throw error
    return data
  }
}

// =============================================
// BILDIRISHNOMALAR
// =============================================
export const notifications = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data
  },

  markRead: async (notifId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId)
    if (error) throw error
  },

  markAllRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
    if (error) throw error
  },

  create: async ({ userId, title, message, type }) => {
    const { error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, title, message, type })
    if (error) throw error
  },

  // Real-time bildirishnomalar
  subscribe: (userId, callback) => {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

// =============================================
// VALYUTA KURSLARI
// =============================================
export const currency = {
  getRates: async () => {
    try {
      const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/')
      const data = await res.json()
      const rates = {}
      data.forEach(item => { rates[item.Ccy] = parseFloat(item.Rate) })
      return rates
    } catch {
      // Fallback rates
      return { USD: 12750, EUR: 13900, RUB: 142, AED: 3470, GBP: 16100 }
    }
  }
}

// =============================================
// YORDAMCHI FUNKSIYALAR
// =============================================
export const formatSum = (amount) => {
  if (!amount) return '0 so\'m'
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + ' MLN so\'m'
  if (amount >= 1000) return (amount / 1000).toFixed(0) + ' K so\'m'
  return amount.toLocaleString() + ' so\'m'
}

export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const months = ['Yan','Fev','Mar','Apr','May','Iyun','Iyul','Avg','Sen','Okt','Noy','Dek']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export const timeAgo = (dateStr) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Hozirgina'
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
  if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`
  return formatDate(dateStr)
}
