import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

type AddSkillProps = {
  onClose: () => void;
  onSkillAdded: () => void;
};

const CATEGORIES = [
  'Programming Language',
  'Framework',
  'Database',
  'DevOps',
  'Data Structures',
  'Algorithms',
  'System Design',
  'Tools',
  'Other',
];

export function AddSkill({ onClose, onSkillAdded }: AddSkillProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [initialProficiency, setInitialProficiency] = useState(70);
  const [decayRate, setDecayRate] = useState(0.05);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('skills').insert({
      name,
      category,
      initial_proficiency: initialProficiency,
      current_score: initialProficiency,
      decay_rate: decayRate,
      user_id: userData.user.id,
      last_practiced_at: new Date().toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      onSkillAdded();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Skill</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Skill Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., React, Python, SQL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Proficiency: {initialProficiency}%
            </label>
            <input
              id="proficiency"
              type="range"
              min="0"
              max="100"
              value={initialProficiency}
              onChange={(e) => setInitialProficiency(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          <div>
            <label htmlFor="decayRate" className="block text-sm font-medium text-gray-700 mb-1">
              Decay Rate: {(decayRate * 100).toFixed(1)}%
            </label>
            <input
              id="decayRate"
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={decayRate}
              onChange={(e) => setDecayRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow decay</span>
              <span>Fast decay</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Higher decay rate means you forget faster without practice
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
