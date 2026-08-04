import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import { SPIRITUAL_INTERESTS, SPIRITUAL_GOALS, READING_PREFERENCES, AGE_GROUPS, EXPERIENCE_LEVELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProfileForm = ({ existingProfile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    display_name: '', age_group: '', gender: '', location: '', timezone: '',
    spiritual_interests: [], spiritual_goals: [], reading_preferences: [],
    experience_level: '', daily_guidance_enabled: true, reading_reminders_enabled: true,
    insight_updates_enabled: true, spiritual_growth_alerts: true, preferred_language: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!existingProfile);

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        display_name: existingProfile.display_name || '', age_group: existingProfile.age_group || '',
        gender: existingProfile.gender || '', location: existingProfile.location || '',
        timezone: existingProfile.timezone || '',
        spiritual_interests: existingProfile.spiritual_interests || [],
        spiritual_goals: existingProfile.spiritual_goals || [],
        reading_preferences: existingProfile.reading_preferences || [],
        experience_level: existingProfile.experience_level || '',
        daily_guidance_enabled: existingProfile.daily_guidance_enabled ?? true,
        reading_reminders_enabled: existingProfile.reading_reminders_enabled ?? true,
        insight_updates_enabled: existingProfile.insight_updates_enabled ?? true,
        spiritual_growth_alerts: existingProfile.spiritual_growth_alerts ?? true,
        preferred_language: existingProfile.preferred_language || 'en',
      });
    }
  }, [existingProfile]);

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (existingProfile) {
        result = await profileService.updateProfile(formData);
        toast.success('Profile updated successfully! ✨');
      } else {
        result = await profileService.createProfile(formData);
        toast.success('Profile created successfully! 🔮');
      }
      if (onProfileUpdated) onProfileUpdated(result);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-300">{label}</span>
      <button type="button" onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const MultiSelectChips = ({ options, selected, onChange, label }) => (
    <div>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onChange(option)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selected.includes(option) ? 'bg-primary-600 text-white border border-primary-500'
                : 'bg-dark-800/50 text-gray-400 border border-gray-600/30 hover:border-primary-700/50'}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mystical text-xl gradient-text">Spiritual Profile</h2>
        {existingProfile && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="mystic-btn-outline text-sm">Edit Profile</button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Display Name</label>
            <input type="text" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="mystic-input" placeholder="Your mystical name" disabled={!isEditing} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Age Group</label>
            <select value={formData.age_group} onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
              className="mystic-input" disabled={!isEditing}>
              <option value="">Select age group</option>
              {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Gender</label>
            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="mystic-input" disabled={!isEditing}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mystic-input" placeholder="City, Country" disabled={!isEditing} />
          </div>
        </div>
        <MultiSelectChips label="Spiritual Interests" options={SPIRITUAL_INTERESTS}
          selected={formData.spiritual_interests} onChange={(val) => handleMultiSelect('spiritual_interests', val)} />
        <MultiSelectChips label="Spiritual Goals" options={SPIRITUAL_GOALS}
          selected={formData.spiritual_goals} onChange={(val) => handleMultiSelect('spiritual_goals', val)} />
        <MultiSelectChips label="Reading Preferences" options={READING_PREFERENCES}
          selected={formData.reading_preferences} onChange={(val) => handleMultiSelect('reading_preferences', val)} />
        <div>
          <label className="block text-sm text-gray-300 mb-2">Experience Level</label>
          <div className="flex space-x-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button key={level.value} type="button" onClick={() => setFormData({ ...formData, experience_level: level.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.experience_level === level.value ? 'bg-primary-600 text-white' : 'bg-dark-800/50 text-gray-400 border border-gray-600/30'}`}
                disabled={!isEditing}>{level.label}</button>
            ))}
          </div>
        </div>
        <div className="glass-card p-4 bg-dark-800/30">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Notification Settings</h3>
          <div className="space-y-1">
            <ToggleSwitch label="Daily Guidance" checked={formData.daily_guidance_enabled}
              onChange={() => setFormData(prev => ({ ...prev, daily_guidance_enabled: !prev.daily_guidance_enabled }))} />
            <ToggleSwitch label="Reading Reminders" checked={formData.reading_reminders_enabled}
              onChange={() => setFormData(prev => ({ ...prev, reading_reminders_enabled: !prev.reading_reminders_enabled }))} />
            <ToggleSwitch label="Insight Updates" checked={formData.insight_updates_enabled}
              onChange={() => setFormData(prev => ({ ...prev, insight_updates_enabled: !prev.insight_updates_enabled }))} />
            <ToggleSwitch label="Spiritual Growth Alerts" checked={formData.spiritual_growth_alerts}
              onChange={() => setFormData(prev => ({ ...prev, spiritual_growth_alerts: !prev.spiritual_growth_alerts }))} />
          </div>
        </div>
        {isEditing && (
          <div className="flex space-x-3">
            <button type="submit" disabled={loading} className="mystic-btn flex-1 disabled:opacity-50">
              {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
            {existingProfile && (
              <button type="button" onClick={() => setIsEditing(false)} className="mystic-btn-outline flex-1">Cancel</button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;