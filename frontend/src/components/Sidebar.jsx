import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

// Sidebar component - navigation menu
// Simple sidebar with Home navigation

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { icon: FaHome, label: 'Home', path: '/' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-[57px] bottom-0 w-64 bg-dark-400 border-r border-dark-200 z-40
          transform transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg mb-1
                  transition-colors
                  ${isActive 
                    ? 'bg-dark-200 text-primary font-semibold' 
                    : 'hover:bg-dark-300 text-gray-300'
                  }
                `}
              >
                <Icon className="text-xl" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
