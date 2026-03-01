import { NavLink } from "react-router-dom";
import { Calendar, Map, Mic, SquareUser, Trophy, User } from "lucide-react";
import { useConference } from "@/app/contexts/ConferenceContext";
import { BOOTH_DATA } from "@/lib/sessionData";

export function Navigation() {
  const { activeConference } = useConference();
  const hasBooths = !!BOOTH_DATA[activeConference.id];

  const navItems = [
    { to: "/schedule", icon: Calendar, label: "Schedule" },
    { to: "/forums", icon: Mic, label: "Forums" },
    { to: "/maps", icon: Map, label: "Maps" },
    //{ to: '/alerts', icon: Bell, label: 'Prizes' },
    //{ to: '/profile', icon: User, label: 'Profile' },
    {
      to: "/exhibitors",
      icon: SquareUser,
      label: "Exhibitors",
      disabled: !hasBooths,
    },
    { to: "/prizes", icon: Trophy, label: "Prizes" },
    { to: "/attendees", icon: User, label: "Attendees" },
  ];

  return (
    <nav className="w-full mb-8">
      <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {navItems.map(({ to, icon: Icon, label, disabled }) =>
          disabled ? (
            <span
              key={to}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </span>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ),
        )}
      </div>
    </nav>
  );
}
