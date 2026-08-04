import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { ROLE_LABELS } from '../utils/constants';
import { FiActivity, FiStar } from 'react-icons/fi';
import PalmHandSVG from '../components/common/PalmHandSVG';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const [readingStats, profileData] = await Promise.all([
        profileService.getReadingStats().catch(() => null),
        profileService.getProfile().catch(() => null),
      ]);
      setStats(readingStats);
      setProfile(profileData);
    } catch (error) { console.error('Error loading dashboard:', error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center"><div className="text-4xl animate-float mb-4">🔮</div><p className="text-gray-400">Loading your dashboard...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-mystical text-3xl gradient-text font-bold mb-2">
            Welcome, {user?.first_name || user?.username || 'Seeker'} ✨
          </h1>
          <p className="text-gray-400">Your spiritual journey dashboard • {ROLE_LABELS[user?.role] || 'Member'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <FiActivity className="text-primary-400" size={24} />
              <span className="text-xs text-gray-500">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.total_sessions || 0}</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">🖐️</span>
              <span className="text-xs text-gray-500">Palm Readings</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.palm_readings || 0}</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">🎴</span>
              <span className="text-xs text-gray-500">Tarot Readings</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.tarot_readings || 0}</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <FiStar className="text-mystic-400" size={24} />
              <span className="text-xs text-gray-500">Insight Score</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.average_insight_score?.toFixed(1) || '0.0'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 hover:border-primary-600/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <PalmHandSVG animate={false} showLabels={false} size={80} />
              </div>
              <div className="flex-1">
                <h3 className="font-mystical text-lg text-white mb-2">Palm Reading</h3>
                <p className="text-gray-400 text-sm mb-4">Upload your palm image for AI-powered analysis of your life, heart, head, and fate lines.</p>
                <a href="/palm-reading" className="mystic-btn text-sm inline-block">Start Palm Reading</a>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 hover:border-primary-600/30 transition-all">
            <div className="text-4xl mb-3">🎴</div>
            <h3 className="font-mystical text-lg text-white mb-2">Tarot Reading</h3>
            <p className="text-gray-400 text-sm mb-4">Choose your spread and receive personalized tarot card interpretations and guidance.</p>
            <a href="/tarot-reading" className="mystic-btn text-sm inline-block">Start Tarot Reading</a>
          </div>
        </div>

        {!profile && (
          <div className="glass-card p-6 border-mystic-500/30 bg-mystic-900/10">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="text-white font-medium">Complete Your Spiritual Profile</h3>
                <p className="text-gray-400 text-sm">Set up your profile to receive personalized readings and insights.</p>
              </div>
              <a href="/profile" className="mystic-btn text-sm ml-auto">Setup Profile</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;