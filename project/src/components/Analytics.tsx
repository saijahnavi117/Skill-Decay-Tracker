import { Skill, Activity } from '../lib/supabase';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

type AnalyticsProps = {
  skills: Skill[];
  activities: Activity[];
};

export function Analytics({ skills, activities }: AnalyticsProps) {
  const averageScore = skills.length > 0
    ? skills.reduce((sum, s) => sum + s.current_score, 0) / skills.length
    : 0;

  const strongSkills = skills.filter((s) => s.current_score >= 80);
  const weakSkills = skills.filter((s) => s.current_score < 50);

  const last7Days = activities.filter((a) => {
    const date = new Date(a.practiced_at);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  const totalPracticeTime = activities.reduce((sum, a) => sum + a.duration_minutes, 0);
  const avgPracticeTime = activities.length > 0 ? totalPracticeTime / activities.length : 0;

  const categoryBreakdown = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Avg Score</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Strong Skills</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{strongSkills.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Needs Practice</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{weakSkills.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Practice Time</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{Math.round(totalPracticeTime / 60)}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last 7 days</span>
              <span className="font-semibold text-gray-900">{last7Days.length} sessions</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total sessions</span>
              <span className="font-semibold text-gray-900">{activities.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg session duration</span>
              <span className="font-semibold text-gray-900">{Math.round(avgPracticeTime)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total practice time</span>
              <span className="font-semibold text-gray-900">
                {Math.round(totalPracticeTime / 60)}h {totalPracticeTime % 60}m
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills by Category</h3>
          <div className="space-y-3">
            {topCategories.length > 0 ? (
              topCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{category}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / skills.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No skills added yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Freshness Overview</h3>
        <div className="space-y-3">
          {skills.length > 0 ? (
            skills
              .sort((a, b) => b.current_score - a.current_score)
              .map((skill) => (
                <div key={skill.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {skill.current_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          skill.current_score >= 80
                            ? 'bg-green-500'
                            : skill.current_score >= 60
                            ? 'bg-blue-500'
                            : skill.current_score >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${skill.current_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Add skills to see analytics
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
