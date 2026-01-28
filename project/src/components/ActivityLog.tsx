import { useState } from 'react';
import { Skill, Activity, supabase } from '../lib/supabase';
import { Plus, Clock, Calendar, FileText } from 'lucide-react';
import { calculateBoostFromActivity } from '../utils/skillDecay';

type ActivityLogProps = {
  skills: Skill[];
  activities: Activity[];
  onActivityLogged: () => void;
};

const ACTIVITY_TYPES = [
  { value: 'coding', label: 'Coding' },
  { value: 'reading', label: 'Reading' },
  { value: 'project', label: 'Project' },
  { value: 'practice', label: 'Practice' },
  { value: 'tutorial', label: 'Tutorial' },
];

export function ActivityLog({ skills, activities, onActivityLogged }: ActivityLogProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [activityType, setActivityType] = useState('practice');
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const skill = skills.find((s) => s.id === selectedSkillId);
    if (!skill) return;

    const boost = calculateBoostFromActivity(duration, difficulty);
    const newScore = Math.min(100, skill.current_score + boost);

    await supabase.from('activities').insert({
      user_id: userData.user.id,
      skill_id: selectedSkillId,
      activity_type: activityType,
      duration_minutes: duration,
      difficulty,
      notes,
      practiced_at: new Date().toISOString(),
    });

    await supabase
      .from('skills')
      .update({
        current_score: newScore,
        last_practiced_at: new Date().toISOString(),
      })
      .eq('id', selectedSkillId);

    setShowAddForm(false);
    setNotes('');
    setLoading(false);
    onActivityLogged();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Practice Session</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
                Skill
              </label>
              <select
                id="skill"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                id="type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration: {duration} minutes
              </label>
              <input
                id="duration"
                type="range"
                min="5"
                max="240"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty: {difficulty}/5
              </label>
              <input
                id="difficulty"
                type="range"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What did you work on?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Logging...' : 'Log Activity'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600">Log your first practice session to track progress!</p>
          </div>
        ) : (
          activities.map((activity) => {
            const skill = skills.find((s) => s.id === activity.skill_id);
            return (
              <div
                key={activity.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{skill?.name || 'Unknown'}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {activity.activity_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(activity.practiced_at).toLocaleDateString()}
                      </div>
                      <div>Difficulty: {activity.difficulty}/5</div>
                    </div>
                    {activity.notes && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{activity.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
