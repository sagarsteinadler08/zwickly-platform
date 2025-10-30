import React, { useEffect, useState } from 'react';

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
    setVoting(true);
    await fetch(`/api/chat/channels/${channelId}/polls/${poll.id}/votes`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, optionId: selected })
    });
    setVoting(false);
  };
  if (!results) return <div className="poll-loading animate-pulse">Loading poll…</div>;
  const total = results.options.reduce((a: number, b: any) => a + b.count, 0);
  return (
    <div className="poll-view my-4 rounded-xl bg-gradient-to-r from-[#E0E7FF]/60 to-[#B2FEFA]/40 p-4 animate-fadeIn">
      <div className="font-bold mb-1">{poll.question}</div>
      <div className="space-y-1">
        {results.options.map((opt: any) => (
          <div key={opt.optionId} className="flex items-center gap-2 animate-pollOptionAppear">
            <input type="radio" name={`poll-${poll.id}`} value={opt.optionId}
              checked={selected === opt.optionId}
              disabled={voting || results.userVote !== null || poll.isClosed}
              onChange={() => setSelected(opt.optionId)}
            />
            <label>{opt.text}</label>
            <div className="poll-bar" style={{ width: Math.max(16, (opt.count/(total||1))*180) }} />
            <span>{opt.count}</span>
          </div>
        ))}
      </div>
      {results.userVote === null && !poll.isClosed &&
        <button className="poll-btn" disabled={!selected || voting} onClick={handleVote}>Vote</button>}
      {(results.userVote !== null || poll.isClosed) && <div className="text-xs mt-2">Results ({total} votes)</div>}
    </div>
  );
};
export default PollView;
