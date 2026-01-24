
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Filters({ selectedType, onTypeChange }) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Latest Requests <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Live</span>
                </h2>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                        <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 peer-checked:bg-[var(--primary)]">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="absolute left-[2px] h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-full peer-checked:border-white"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Match My Blood Type</span>
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => onTypeChange(null)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm whitespace-nowrap transition-all",
                        !selectedType
                            ? "bg-[var(--foreground)] text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    All Requests
                </button>

                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => (
                    <button
                        key={type}
                        onClick={() => onTypeChange(type === selectedType ? null : type)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border",
                            selectedType === type
                                ? "bg-red-600 text-white border-red-600 shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-[var(--primary)] hover:border-red-100"
                        )}
                    >
                        {type}
                    </button>
                ))}

                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap ml-auto">
                    <MapPin className="w-4 h-4" />
                    Distance: Nearby
                </button>
            </div>
        </div>
    );
}
