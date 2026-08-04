import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileForm from '../components/profile/ProfileForm';
import { profileService } from '../services/profileService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      if (error.response?.status !== 404) toast.error('Failed to load profile');
    } finally { setLoading(false); }
  };

  const handleProfileUpdated = (updatedProfile) => setProfile(updatedProfile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center"><div className="text-4xl animate-float mb-4">🔮</div><p className="text-gray-400">Loading profile...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-mystical text-3xl gradient-text font-bold mb-2">My Profile ✨</h1>
          <p className="text-gray-400">Manage your spiritual profile and preferences</p>
        </div>
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-mystic-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-primary-900/30 text-primary-300 border border-primary-700/30 mt-1 inline-block">{user?.role}</span>
            </div>
          </div>
        </div>
        <ProfileForm existingProfile={profile} onProfileUpdated={handleProfileUpdated} />
      </div>
    </div>
  );
};

export default ProfilePage;