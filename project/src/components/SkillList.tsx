import { useState } from 'react';
import { Skill, supabase } from '../lib/supabase';
import { Trash2, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { getSkillFreshnessLevel, getDaysSince } from '../utils/skillDecay';

type SkillListProps = {
  skills: Skill[];
  onSkillDeleted: () => void;
};

export function SkillList({ skills, onSkillDeleted }: SkillListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    setDeletingId(id);
    const { error } = await supabase.from('skills').delete().eq('id', id);

    if (!error) {
      onSkillDeleted();
    }
    setDeletingId(null);
  };

  if (skills.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills yet</h3>
        <p className="text-gray-600">Add your first skill to start tracking your knowledge!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skills.map((skill) => {
        const daysSince = getDaysSince(skill.last_practiced_at);
        const freshness = getSkillFreshnessLevel(skill.current_score);

        return (
          <div
            key={skill.id}
            className={`bg-white rounded-xl border p-6 hover:shadow-md transition-shadow ${freshness.bgColor}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{daysSince === 0 ? 'Today' : `${daysSince}d ago`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>{(skill.decay_rate * 100).toFixed(1)}% decay rate</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(skill.id)}
                disabled={deletingId === skill.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className={`font-semibold ${freshness.color}`}>{freshness.label}</span>
                <span className="font-bold text-gray-900">{skill.current_score.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    freshness.level === 'excellent'
                      ? 'bg-green-500'
                      : freshness.level === 'good'
                      ? 'bg-blue-500'
                      : freshness.level === 'fair'
                      ? 'bg-yellow-500'
                      : freshness.level === 'poor'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${skill.current_score}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
