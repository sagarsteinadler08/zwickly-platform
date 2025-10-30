import React, { useEffect, useState } from 'react';
import { Check, BarChart3 } from 'lucide-react';

interface PollViewProps { poll: any; channelId: string; userId: string; }
const PollView: React.FC<PollViewProps> = ({ poll, channelId, userId }) => {
  const [results, setResults] = useState<any>(null);
  const [voting, setVoting] = useState(false);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    fetch(`/api/chat/channels/${channelId}/polls/${poll.id}/votes?userId=${userId}`)
      .then(r => r.json()).then(data => { setResults(data); setSelected(data.userVote); });
  }, [poll.id, channelId, userId]);

  const handleVote = async () => {
    if (!selected) return;
    setVoting(true);
    try {
      await fetch(`/api/chat/channels/${channelId}/polls/${poll.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, optionId: selected })
      });
      // Refresh results
      const res = await fetch(`/api/chat/channels/${channelId}/polls/${poll.id}/votes?userId=${userId}`);
      const data = await res.json();
      setResults(data);
      setSelected(data.userVote);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  if (!results) {
    return (
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  const total = results.options.reduce((a: number, b: any) => a + b.count, 0);
  const hasVoted = results.userVote !== null;
  const isClosed = poll.isClosed;

  return (
    <div className="flex gap-3">
      {/* Avatar with poll icon */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Poll content */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Poll header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-semibold text-gray-900">Admin User</span>
            <span className="text-xs text-gray-500 ml-2">Oct 29, 11:00 AM</span>
          </div>
        </div>

        <div className="text-gray-800">Quick poll: Which date works best for the Hackathon?</div>

        {/* Poll question */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <BarChart3 className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900">{poll.question}</span>
        </div>

        {/* Poll options */}
        <div className="space-y-2">
          {results.options.map((opt: any, idx: number) => {
            const percentage = total > 0 ? Math.round((opt.count / total) * 100) : 0;
            const isSelected = selected === opt.optionId;
            const isWinning = opt.count > 0 && opt.count === Math.max(...results.options.map((o: any) => o.count));

            return (
              <div key={opt.optionId} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  value={opt.optionId}
                  checked={isSelected && !hasVoted}
                  disabled={hasVoted || isClosed || voting}
                  onChange={() => setSelected(opt.optionId)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-800">{opt.text}</span>
                    {hasVoted || isClosed ? (
                      <span className="text-xs font-medium text-gray-600">
                        {opt.count} ({percentage}%)
                      </span>
                    ) : null}
                  </div>
                  {hasVoted || isClosed ? (
                    <div className="mt-1 relative">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isWinning ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.max(2, percentage)}%` }}
                        />
                      </div>
                      {isSelected && hasVoted && (
                        <Check className="absolute right-0 top-0.5 w-4 h-4 text-green-600" />
                      )}
                    </div>
                  ) : null}
                </label>
              </div>
            );
          })}
        </div>

        {/* Vote button or results */}
        {!hasVoted && !isClosed && (
          <button
            onClick={handleVote}
            disabled={!selected || voting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? 'Voting...' : 'Vote'}
          </button>
        )}

        {(hasVoted || isClosed) && (
          <div className="text-xs text-gray-500 font-medium border-t border-gray-200 pt-2">
            Results ({total} {total === 1 ? 'vote' : 'votes'})
          </div>
        )}
      </div>
    </div>
  );
};

export default PollView;
