import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchTimetable, TimetableEntry, WEEKDAYS, getTodayDayInGerman } from "@/lib/timetableApi";

const TimetableCard = () => {
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDayInGerman());
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(
    WEEKDAYS.indexOf(getTodayDayInGerman())
  );

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      const data = await fetchTimetable(selectedDay);
      setSchedule(data);
      setLoading(false);
    };

    loadTimetable();
  }, [selectedDay]);

  const handlePreviousDay = () => {
    const newIndex = currentDayIndex > 0 ? currentDayIndex - 1 : WEEKDAYS.length - 1;
    setCurrentDayIndex(newIndex);
    setSelectedDay(WEEKDAYS[newIndex]);
  };

  const handleNextDay = () => {
    const newIndex = currentDayIndex < WEEKDAYS.length - 1 ? currentDayIndex + 1 : 0;
    setCurrentDayIndex(newIndex);
    setSelectedDay(WEEKDAYS[newIndex]);
  };

  const isToday = selectedDay === getTodayDayInGerman();

  const getDayAbbreviation = (day: string): string => {
    const abbreviations: { [key: string]: string } = {
      Montag: "Mo",
      Dienstag: "Di",
      Mittwoch: "Mi",
      Donnerstag: "Do",
      Freitag: "Fr"
    };
    return abbreviations[day] || day.substring(0, 2);
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-white animate-fade-in">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Timetable</h3>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md border border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousDay}
              className="h-7 w-7 hover:bg-purple-100 rounded-full"
            >
              <ChevronLeft className="h-4 w-4 text-purple-600" />
            </Button>
            <span className="text-sm font-bold text-purple-600 min-w-[2.5rem] text-center px-2">
              {getDayAbbreviation(selectedDay)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-7 w-7 hover:bg-purple-100 rounded-full"
            >
              <ChevronRight className="h-4 w-4 text-purple-600" />
            </Button>
          </div>
        </div>
      
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading schedule...</div>
      ) : schedule.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No classes scheduled for {selectedDay}</div>
      ) : (
        <div className="space-y-3">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="relative p-4 rounded-xl bg-white border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-purple-100">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-bold text-purple-600">{item.dayTime}</span>
                </div>
                {item.room && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                    <MapPin className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">{item.room}</span>
                  </div>
                )}
              </div>
              
              <p className="font-bold text-gray-900 mb-2 text-sm leading-snug">{item.course}</p>
              
              {item.instructor && (
                <p className="text-xs text-gray-600 mb-1">👨‍🏫 {item.instructor}</p>
              )}
              
              {item.cycle && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>{item.cycle}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TimetableCard;
