import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Skill, Activity } from '../lib/supabase';
import { SkillList } from './SkillList';
import { AddSkill } from './AddSkill';
import { ActivityLog } from './ActivityLog';
import { Analytics } from './Analytics';
import { RevisionSuggestions } from './RevisionSuggestions';
import { Brain, LogOut, Plus, Activity as ActivityIcon, BarChart3, Calendar } from 'lucide-react';
import { calculateDecayedScore, getDaysSince } from '../utils/skillDecay';

type View = 'skills' | 'activities' | 'analytics';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [currentView, setCurrentView] = useState<View>('skills');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadSkills(), loadActivities()]);
    setLoading(false);
  };

  const loadSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const updatedSkills = data.map((skill) => {
        const daysSince = getDaysSince(skill.last_practiced_at);
        const decayedScore = calculateDecayedScore(
          skill.current_score,
          skill.decay_rate,
          daysSince
        );
        return { ...skill, current_score: decayedScore };
      });
      setSkills(updatedSkills);
    }
  };

  const loadActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('practiced_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setActivities(data);
    }
  };

  const handleSkillAdded = () => {
    setShowAddSkill(false);
    loadSkills();
  };

  const handleActivityLogged = () => {
    loadData();
  };

  const handleSkillDeleted = () => {
    loadSkills();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Skill Decay Tracker</h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCurrentView('skills')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'skills'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Skills
          </button>
          <button
            onClick={() => setCurrentView('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'activities'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ActivityIcon className="w-4 h-4" />
            Activities
          </button>
          <button
            onClick={() => setCurrentView('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {currentView === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Skills</h2>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
              <SkillList skills={skills} onSkillDeleted={handleSkillDeleted} />
            </div>
            <div>
              <RevisionSuggestions skills={skills} />
            </div>
          </div>
        )}

        {currentView === 'activities' && (
          <ActivityLog
            skills={skills}
            activities={activities}
            onActivityLogged={handleActivityLogged}
          />
        )}

        {currentView === 'analytics' && <Analytics skills={skills} activities={activities} />}
      </div>

      {showAddSkill && (
        <AddSkill onClose={() => setShowAddSkill(false)} onSkillAdded={handleSkillAdded} />
      )}
    </div>
  );
}
