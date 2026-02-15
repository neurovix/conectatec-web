"use client";

import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from 'react'
import { User, Heart, Users, TrendingUp, Award, Eye, Calendar, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number
  activeUsers: number
  totalMatches: number
  todayMatches: number
  premiumUsers: number
  completedProfiles: number
  totalLikes: number
  avgSwipesPerUser: number
}

interface RecentUser {
  id_user: string
  name: string
  age: number
  gender: string
  degree: string
  created_at: string
  profile_completed: boolean
  is_premium: boolean
}

interface TopMatch {
  id_user: string
  name: string
  match_count: number
}

interface GenderDistribution {
  name: string
  count: number
}

export default function AdminPage() {
  const supabase = createClient();
  
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMatches: 0,
    todayMatches: 0,
    premiumUsers: 0,
    completedProfiles: 0,
    totalLikes: 0,
    avgSwipesPerUser: 0
  })
  
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [topMatches, setTopMatches] = useState<TopMatch[]>([])
  const [genderDist, setGenderDist] = useState<GenderDistribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time subscription for new users
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'users' },
        () => fetchDashboardData()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        () => fetchDashboardData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch active users (users who swiped in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { count: activeUsers } = await supabase
        .from('user_swipes')
        .select('id_user', { count: 'exact', head: true })
        .gte('swipe_date', sevenDaysAgo.toISOString().split('T')[0])

      // Fetch total matches
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

      // Fetch today's matches
      const today = new Date().toISOString().split('T')[0]
      const { count: todayMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('matched_at', today)

      // Fetch premium users
      const { count: premiumUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true)

      // Fetch completed profiles
      const { count: completedProfiles } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('profile_completed', true)

      // Fetch total likes
      const { count: totalLikes } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })

      // Fetch average swipes per user
      const { data: swipeData } = await supabase
        .from('user_swipes')
        .select('swipe_count')
      
      const avgSwipes = swipeData && swipeData.length > 0
        ? Math.round(swipeData.reduce((acc, curr) => acc + curr.swipe_count, 0) / swipeData.length)
        : 0

      // Fetch recent users
      const { data: recentUsersData } = await supabase
        .from('users')
        .select(`
          id_user,
          name,
          age,
          created_at,
          profile_completed,
          is_premium,
          genders(name),
          degrees(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch matches data to calculate top matched users
      const { data: matchesData } = await supabase
        .from('matches')
        .select('id_user_1, id_user_2')
      
      let processedTopMatches: TopMatch[] = []
      if (matchesData && matchesData.length > 0) {
        const matchCounts = new Map<string, number>()
        matchesData.forEach(match => {
          matchCounts.set(match.id_user_1, (matchCounts.get(match.id_user_1) || 0) + 1)
          matchCounts.set(match.id_user_2, (matchCounts.get(match.id_user_2) || 0) + 1)
        })
        
        const topUserIds = Array.from(matchCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
        
        for (const [userId, count] of topUserIds) {
          const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('id_user', userId)
            .single()
          
          if (userData) {
            processedTopMatches.push({
              id_user: userId,
              name: userData.name,
              match_count: count
            })
          }
        }
      }

      // Fetch gender distribution
      const { data: genderDistData } = await supabase
        .from('users')
        .select('genders(name)')
      
      const genderCounts = new Map<string, number>()
      genderDistData?.forEach(item => {
        const gender = (item as any).genders?.name || 'Unknown'
        genderCounts.set(gender, (genderCounts.get(gender) || 0) + 1)
      })
      
      const genderDistribution = Array.from(genderCounts.entries()).map(([name, count]) => ({
        name,
        count
      }))

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalMatches: totalMatches || 0,
        todayMatches: todayMatches || 0,
        premiumUsers: premiumUsers || 0,
        completedProfiles: completedProfiles || 0,
        totalLikes: totalLikes || 0,
        avgSwipesPerUser: avgSwipes
      })

      setRecentUsers(
        recentUsersData?.map(u => ({
          id_user: u.id_user,
          name: u.name,
          age: u.age,
          gender: (u as any).genders?.name || 'N/A',
          degree: (u as any).degrees?.name || 'N/A',
          created_at: u.created_at,
          profile_completed: u.profile_completed,
          is_premium: u.is_premium
        })) || []
      )

      setTopMatches(processedTopMatches)
      setGenderDist(genderDistribution)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={14} />
              {change > 0 ? '+' : ''}{change}% vs last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
              TINDERTEC
            </div>
            <span className="text-gray-400">Admin Dashboard</span>
          </div>
          <p className="text-gray-600">Real-time analytics and user management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            change={12}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Activity}
            label="Active Users (7d)"
            value={stats.activeUsers}
            change={8}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={Heart}
            label="Total Matches"
            value={stats.totalMatches}
            change={15}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
          />
          <StatCard
            icon={Award}
            label="Premium Users"
            value={stats.premiumUsers}
            change={5}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-pink-500" size={20} />
              <p className="text-gray-600 text-sm font-medium">Today's Matches</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayMatches}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="text-blue-500" size={20} />
              <p className="text-gray-600 text-sm font-medium">Completed Profiles</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedProfiles}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-red-500" size={20} />
              <p className="text-gray-600 text-sm font-medium">Total Likes</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-500" size={20} />
              <p className="text-gray-600 text-sm font-medium">Avg Swipes/User</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgSwipesPerUser}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User size={20} className="text-pink-500" />
                Recent Users
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentUsers.map((user) => (
                    <tr key={user.id_user} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {user.name}
                          {user.is_premium && (
                            <Award size={14} className="text-purple-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.age}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.gender}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.profile_completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.profile_completed ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Matched Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart size={20} className="text-pink-500" />
                Top Matched Users
              </h2>
            </div>
            <div className="p-6">
              {topMatches.length > 0 ? (
                <div className="space-y-4">
                  {topMatches.map((user, idx) => (
                    <div key={user.id_user} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-pink-600 font-bold">
                        <Heart size={16} fill="currentColor" />
                        {user.match_count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No match data available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={20} className="text-pink-500" />
            Gender Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {genderDist.map((item) => (
              <div key={item.name} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">{item.name}</p>
                <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalUsers > 0 ? ((item.count / stats.totalUsers) * 100).toFixed(1) : '0.0'}% of users
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}