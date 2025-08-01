
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import '@/styles/modal-fixes.css';
import '@/styles/student-modal-fix.css';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import StudentsSection from '@/components/StudentsSection';
import PaymentsSection from '@/components/PaymentsSection';
import SettingsSection from '@/components/SettingsSection';
import ReportsSection from '@/components/ReportsSection';
import DocumentsSection from '@/components/DocumentsSection';
import CoursesSection from '@/components/CoursesSection';
import ScheduleSection from '@/components/ScheduleSection';
import AccountStatementSection from '@/components/AccountStatementSection';
import CashCutSection from '@/components/CashCutSection';
import UserManagementSection from '@/components/UserManagementSection';
import Login from '@/components/Login';
import { Loader2 } from 'lucide-react';
import PlaceholderSection from '@/components/PlaceholderSection';
import AuditLogSection from '@/components/AuditLogSection';
import NotificationManager from '@/components/NotificationManager';

const backgroundThemes = {
  default: { from: '#1e1b4b', via: '#4c1d95', to: '#0f172a' },
  sunset: { from: '#4a044e', via: '#c12b4b', to: '#f7b733' },
  ocean: { from: '#000428', via: '#004e92', to: '#1CB5E0' },
  forest: { from: '#134E5E', via: '#203A43', to: '#71B280' },
  lavender: { from: '#474350', via: '#9D50BB', to: '#D8B5FF' },
};


function App() {
  const { session, user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [schoolSettings, setSchoolSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Estado para móviles
  const { toast } = useToast();

  const applyTheme = useCallback((settings) => {
    const themeKey = settings?.background_theme || 'default';
    console.log('🎨 Aplicando tema:', themeKey);
    
    // Guardar tema en localStorage para persistencia
    localStorage.setItem('avanza_polanco_theme', themeKey);
    
    if (settings?.primary_color) {
      const color = settings.primary_color;
      console.log('🎨 Aplicando color primario:', color);
      const parts = color.split(',').map(part => part.trim());
      document.documentElement.style.setProperty('--primary-hue', parts[0]);
      document.documentElement.style.setProperty('--primary-saturation', parts[1]);
      document.documentElement.style.setProperty('--primary-lightness', parts[2]);
      console.log('✅ Variables CSS aplicadas:', {
        '--primary-hue': parts[0],
        '--primary-saturation': parts[1],
        '--primary-lightness': parts[2]
      });
    } else {
      console.log('⚠️ No hay color primario en configuración, usando default');
      // Aplicar color por defecto
      document.documentElement.style.setProperty('--primary-hue', '262');
      document.documentElement.style.setProperty('--primary-saturation', '83%');
      document.documentElement.style.setProperty('--primary-lightness', '58%');
    }

    // Siempre aplicar un tema, usar default si no hay configuración
    const theme = backgroundThemes[themeKey] || backgroundThemes.default;
    
    document.documentElement.style.setProperty('--bg-from', theme.from);
    document.documentElement.style.setProperty('--bg-via', theme.via);
    document.documentElement.style.setProperty('--bg-to', theme.to);
    
    console.log('✅ Tema aplicado y guardado en localStorage:', themeKey, theme);
  }, []);

  const handleSettingsUpdate = useCallback((newSettings) => {
    setSchoolSettings(newSettings);
    applyTheme(newSettings);
  }, [applyTheme]);
  
  const fetchSettings = useCallback(async () => {
    try {
      console.log('🔄 Cargando configuración de la escuela...');
      const { data, error } = await supabase.from('school_settings').select('*').limit(1).maybeSingle();
      
      // Si no hay datos, crear configuración por defecto
      if (!data && !error) {
        console.log('📝 No hay configuración, usando valores por defecto');
        const defaultSettings = {
          school_name: 'Avanza Polanco',
          school_code: 'INSTITUTO_POLANCO',
          address: 'Dirección de Avanza Polanco',
          phone: '+52 123 456 7890',
          email: 'contacto@institutopolanco.edu.mx',
          background_theme: 'default'
        };
        setSchoolSettings(defaultSettings);
        applyTheme(defaultSettings);
        return;
      }
      
      // Si hay datos, usarlos
      if (data) {
        console.log('✅ Configuración cargada desde BD:', data.background_theme || 'default');
        setSchoolSettings(data);
        applyTheme(data);
        return;
      }
      
      // Solo mostrar error si es un error real (no "no rows found")
      if (error && error.code !== 'PGRST116') {
        console.warn("⚠️ Error loading school settings, using defaults:", error);
        const defaultSettings = {
          school_name: 'Avanza Polanco',
          school_code: 'INSTITUTO_POLANCO',
          background_theme: 'default'
        };
        setSchoolSettings(defaultSettings);
        applyTheme(defaultSettings);
      }
    } catch(error) {
       console.warn("❌ Error fetching settings, using defaults:", error);
       const defaultSettings = {
         school_name: 'Avanza Polanco',
         school_code: 'INSTITUTO_POLANCO',
         background_theme: 'default'
       };
       setSchoolSettings(defaultSettings);
       applyTheme(defaultSettings);
    }
  }, [applyTheme]);
  
  const fetchProfileAndData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      // Fetch profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      // Si no existe el perfil, crear uno por defecto
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Perfil no encontrado, creando perfil por defecto para:', user.email);
        const defaultProfile = {
          full_name: user.email || 'Usuario',
          id: user.id
        };
        setProfile(defaultProfile);
      } else if (profileError) {
        console.warn('Error cargando perfil:', profileError);
        // Usar perfil por defecto en lugar de fallar
        const defaultProfile = {
          full_name: user.email || 'Usuario',
          id: user.id
        };
        setProfile(defaultProfile);
      } else {
        setProfile(profileData);
      }

      // Fetch other data
      const [studentsRes, paymentsRes, coursesRes, schedulesRes] = await Promise.all([
        supabase.from('students').select('*, courses(name)').order('created_at', { ascending: false }),
        supabase.from('payments').select('*, students(first_name, last_name, student_number)').order('created_at', { ascending: false }),
        supabase.from('courses').select('*').order('name', { ascending: true }),
        supabase.from('schedules').select('*, courses(name)').order('day_of_week').order('start_time')
      ]);

      // Manejar errores de manera más robusta - usar arrays vacíos en lugar de fallar
      setStudents(studentsRes.error ? [] : (studentsRes.data || []));
      setPayments(paymentsRes.error ? [] : (paymentsRes.data || []));
      setCourses(coursesRes.error ? [] : (coursesRes.data || []));
      setSchedules(schedulesRes.error ? [] : (schedulesRes.data || []));
      
      // Solo logear errores, no fallar
      if (studentsRes.error) console.warn('Error cargando estudiantes:', studentsRes.error);
      if (paymentsRes.error) console.warn('Error cargando pagos:', paymentsRes.error);
      if (coursesRes.error) console.warn('Error cargando cursos:', coursesRes.error);
      if (schedulesRes.error) console.warn('Error cargando horarios:', schedulesRes.error);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar los datos",
        description: "No se pudieron obtener los datos de Supabase. " + error.message,
      });
    } finally {
      setDataLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    // Cargar tema desde localStorage primero para persistencia inmediata
    const savedTheme = localStorage.getItem('avanza_polanco_theme');
    const themeToApply = savedTheme || 'default';
    const theme = backgroundThemes[themeToApply] || backgroundThemes.default;
    
    console.log('🚀 Cargando tema inicial desde localStorage:', themeToApply);
    document.documentElement.style.setProperty('--bg-from', theme.from);
    document.documentElement.style.setProperty('--bg-via', theme.via);
    document.documentElement.style.setProperty('--bg-to', theme.to);
    
    // Cargar configuración de forma secuencial
    const loadData = async () => {
      await fetchSettings(); // Primero cargar configuración y aplicar tema
      
      if (session?.user) {
        await fetchProfileAndData(); // Después cargar datos del usuario
      } else {
        setDataLoading(false);
      }
    };
    
    loadData();
  }, [session, fetchSettings, fetchProfileAndData]);

  const renderSection = () => {
    if (dataLoading && activeSection !== 'settings') {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
        </div>
      );
    }
    
    const activeStudents = students; // Usar todos los estudiantes ya que no hay columna status

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard students={students} payments={payments} schoolSettings={schoolSettings} />;
      case 'users':
        return <UserManagementSection />;
      case 'students':
        return <StudentsSection students={students} courses={courses} schedules={schedules} refreshData={fetchProfileAndData} />;
      case 'payments':
        return <PaymentsSection payments={payments} students={activeStudents} refreshData={fetchProfileAndData} schoolSettings={schoolSettings} />;
      case 'accountStatement':
        return <AccountStatementSection students={students} schoolSettings={schoolSettings} />;
      case 'cashCut':
        return <CashCutSection schoolSettings={schoolSettings} refreshData={fetchProfileAndData} />;
      case 'reports':
        return <ReportsSection schoolSettings={schoolSettings} />;
      case 'documents':
        return <DocumentsSection students={activeStudents} refreshData={fetchProfileAndData} />;
      case 'courses':
        return <CoursesSection refreshData={fetchProfileAndData} />;
      case 'schedule':
        return <ScheduleSection schedules={schedules} courses={courses} refreshData={fetchProfileAndData} schoolSettings={schoolSettings} />;
      case 'audit':
        return <AuditLogSection />;
      case 'settings':
        return <SettingsSection onSettingsChange={handleSettingsUpdate} />;
      default:
        return <PlaceholderSection sectionName={activeSection} />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 justify-center items-center">
        <Loader2 className="h-16 w-16 animate-spin text-white" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }
  
  return (
    <>
      <Helmet>
        <title>EduManager - Sistema de Gestión Escolar</title>
        <meta name="description" content="Sistema completo de gestión escolar para administrar estudiantes, pagos, cursos y más. Interfaz moderna y fácil de usar." />
      </Helmet>
      
      <div className="flex min-h-screen relative">
        {/* Overlay para móviles cuando sidebar está abierto */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - completamente oculto en móviles */}
        <div className="hidden lg:block">
          <Sidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            schoolSettings={schoolSettings} 
            profile={profile}
            sidebarOpen={true}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
        
        {/* Sidebar móvil - solo cuando está abierto */}
        {sidebarOpen && (
          <div className="lg:hidden">
            <Sidebar 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
              schoolSettings={schoolSettings} 
              profile={profile}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        )}
        
        <main className="flex-1 w-full lg:ml-64">
          {/* Header móvil con menú hamburguesa */}
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 p-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-white font-semibold text-lg">
                {schoolSettings?.school_name || 'EduManager'}
              </h1>
              <div className="w-10"></div> {/* Espaciador */}
            </div>
          </div>
          
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mobile-section mobile-full-width"
          >
            {renderSection()}
          </motion.div>
        </main>
        
        {/* Gestor de notificaciones automáticas */}
        <NotificationManager schoolSettings={schoolSettings} />
        
        <Toaster />
      </div>
    </>
  );
}

export default App;
