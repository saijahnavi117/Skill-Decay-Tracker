import { Skill } from '../lib/supabase';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { predictDaysUntilDecay } from '../utils/skillDecay';

type RevisionSuggestionsProps = {
  skills: Skill[];
};

export function RevisionSuggestions({ skills }: RevisionSuggestionsProps) {
  const criticalSkills = skills
    .filter((s) => s.current_score < 50)
    .sort((a, b) => a.current_score - b.current_score);

  const warningSkills = skills
    .filter((s) => s.current_score >= 50 && s.current_score < 70)
    .sort((a, b) => a.current_score - b.current_score);

  const healthySkills = skills.filter((s) => s.current_score >= 70);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revision Plan</h2>

        {criticalSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Critical - Practice Today</h3>
            </div>
            <div className="space-y-2">
              {criticalSkills.map((skill) => {
                const daysUntilZero = predictDaysUntilDecay(skill.current_score, 0, skill.decay_rate);
                return (
                  <div key={skill.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-red-900">{skill.name}</span>
                      <span className="text-sm font-bold text-red-700">
                        {skill.current_score.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-red-700">
                      {daysUntilZero > 0
                        ? `Will reach 0% in ~${daysUntilZero} days`
                        : 'Needs immediate attention'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {warningSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">Practice This Week</h3>
            </div>
            <div className="space-y-2">
              {warningSkills.map((skill) => {
                const daysUntil50 = predictDaysUntilDecay(skill.current_score, 50, skill.decay_rate);
                return (
                  <div key={skill.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-yellow-900">{skill.name}</span>
                      <span className="text-sm font-bold text-yellow-700">
                        {skill.current_score.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Will drop to 50% in ~{daysUntil50} days
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {healthySkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Doing Great</h3>
            </div>
            <div className="space-y-2">
              {healthySkills.slice(0, 3).map((skill) => (
                <div key={skill.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-green-900">{skill.name}</span>
                    <span className="text-sm font-bold text-green-700">
                      {skill.current_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {healthySkills.length > 3 && (
                <p className="text-xs text-gray-600 text-center pt-1">
                  + {healthySkills.length - 3} more healthy skills
                </p>
              )}
            </div>
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Add skills to get personalized revision suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
}
