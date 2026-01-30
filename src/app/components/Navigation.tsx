import { NavLink } from 'react-router-dom';
import { Calendar, Map, User, Bell } from 'lucide-react';

export function Navigation() {
  const navItems = [
    { to: '/maps', icon: Map, label: 'Maps' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/alerts', icon: Bell, label: 'Prizes' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="w-full mb-8">
      <div className="grid grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
