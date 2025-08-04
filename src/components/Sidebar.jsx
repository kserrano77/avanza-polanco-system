
import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserCog,
  CreditCard, 
  Settings, 
  LogOut,
  FileText,
  BookOpen,
  Calendar,
  FileBarChart2,
  FileBox,
  Scissors,
  History,
  Tags
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
  { icon: UserCog, label: 'Usuarios', section: 'users' },
  { icon: Users, label: 'Alumnos', section: 'students' },
  { icon: CreditCard, label: 'Pagos', section: 'payments' },
  { icon: FileBarChart2, label: 'Edo. de Cuenta', section: 'accountStatement' },
  { icon: Scissors, label: 'Corte de Caja', section: 'cashCut' },
  { icon: FileText, label: 'Reportes', section: 'reports' },
  // { icon: FileBox, label: 'Documentos', section: 'documents' }, // OCULTO - Para reactivar después
  { icon: BookOpen, label: 'Cursos', section: 'courses' },
  { icon: Calendar, label: 'Horarios', section: 'schedule' },
  { icon: Tags, label: 'Conceptos', section: 'concepts' },
  { icon: Settings, label: 'Ajustes', section: 'settings' },
];

const Sidebar = ({ activeSection, setActiveSection, schoolSettings, profile, sidebarOpen, setSidebarOpen }) => {
  const handleLogout = () => {
    const keys = Object.keys(localStorage);
    for (let key of keys) {
      if (key.startsWith('sb-') || key.startsWith('supabase.auth.token')) {
        localStorage.removeItem(key);
      }
    }
    window.location.reload();
  };

  const profileName = profile?.full_name || 'Usuario';

  return (
    <motion.div 
      initial={{ x: -256 }}
      animate={{ 
        x: sidebarOpen ? 0 : -256
      }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
      className="flex flex-col w-64 bg-slate-900/95 backdrop-blur-lg text-white border-r border-slate-700/50 fixed h-full z-50 lg:translate-x-0"
    >
      <div className="p-6 flex items-center space-x-4 border-b border-slate-700/50">
        {schoolSettings?.logo_url ? (
          <img src={schoolSettings.logo_url} alt="Logo de la Escuela" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-2xl font-bold">
            {schoolSettings?.school_name ? schoolSettings.school_name.charAt(0) : 'E'}
          </div>
        )}
        <div>
          <p className="font-semibold text-lg">{schoolSettings?.school_name || 'EduManager'}</p>
          <p className="text-xs text-slate-400">Gestión Escolar</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.section}
            variant={activeSection === item.section ? 'secondary' : 'ghost'}
            className="w-full justify-start h-12 text-base lg:h-10 lg:text-sm"
            onClick={() => {
              setActiveSection(item.section);
              // Cerrar sidebar en móviles después de seleccionar
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
          >
            <item.icon className="mr-3 h-6 w-6 lg:h-5 lg:w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold">
            {profileName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{profileName}</p>
            <p className="text-xs text-slate-400">Administrador</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
