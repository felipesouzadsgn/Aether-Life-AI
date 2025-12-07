import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Event } from '../../types';

const events: Event[] = [
  { id: '1', title: 'Product Design Review', time: '10:00 AM', duration: 60, type: 'meeting', attendees: ['Alex', 'Sam'] },
  { id: '2', title: 'Deep Work: Core Engine', time: '01:00 PM', duration: 120, type: 'deep-work' },
  { id: '3', title: 'Gym Session', time: '05:30 PM', duration: 60, type: 'personal' },
];

const AgendaWidget: React.FC = () => {
  const nextEvent = events[0];

  return (
    <GlassCard className="col-span-1 h-full flex flex-col" delay={0.2}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-zinc-500" />
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Up Next</h3>
        </div>
        <span className="text-xs text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded border border-white/5">
          Today
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-start gap-3 mb-1">
          <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <h2 className="text-lg font-normal text-zinc-100 leading-tight mb-2">
              {nextEvent.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{nextEvent.time}</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                 <span>{nextEvent.duration}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mini list for subsequent events */}
      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
        {events.slice(1).map(evt => (
          <div key={evt.id} className="flex items-center justify-between group">
             <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${evt.type === 'personal' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
               <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{evt.title}</span>
             </div>
             <span className="text-[10px] text-zinc-600 font-mono">{evt.time}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default AgendaWidget;