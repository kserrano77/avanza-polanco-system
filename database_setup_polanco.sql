-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
-- INSTITUTO POLANCO - SISTEMA EDUCATIVO
-- =====================================================
-- Este script crea todas las tablas, relaciones y configuraciones
-- necesarias para el sistema educativo del Instituto Polanco
-- 
-- IMPORTANTE: Este es un proyecto COMPLETAMENTE INDEPENDIENTE
-- Base de datos: asqymroylemsrrmfwako.supabase.co
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: profiles (Perfiles de usuario)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'receptionist')) DEFAULT 'receptionist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: school_settings (Configuración de la escuela)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_name TEXT NOT NULL DEFAULT 'Instituto Polanco',
    school_code TEXT NOT NULL DEFAULT 'INSTITUTO_POLANCO',
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: courses (Cursos disponibles)
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_months INTEGER,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: students (Estudiantes)
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    birth_date DATE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')) DEFAULT 'active',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    course_id UUID REFERENCES courses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: schedules (Horarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom TEXT,
    instructor TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: payments (Pagos)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'check')) DEFAULT 'cash',
    concept TEXT NOT NULL,
    receipt_number TEXT UNIQUE,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: cash_cuts (Cortes de caja)
-- =====================================================
CREATE TABLE IF NOT EXISTS cash_cuts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cut_number TEXT UNIQUE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_cash DECIMAL(10,2) DEFAULT 0,
    total_card DECIMAL(10,2) DEFAULT 0,
    total_transfer DECIMAL(10,2) DEFAULT 0,
    total_check DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    payment_count INTEGER DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: attendance (Asistencias)
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    attendance_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: document_templates (Plantillas de documentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('receipt', 'certificate', 'report', 'letter')) NOT NULL,
    template_html TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: issued_documents (Documentos emitidos)
-- =====================================================
CREATE TABLE IF NOT EXISTS issued_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES document_templates(id),
    student_id UUID REFERENCES students(id),
    document_number TEXT UNIQUE NOT NULL,
    document_data JSONB,
    issued_date DATE DEFAULT CURRENT_DATE,
    issued_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: audit_log (Log de auditoría)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS
-- =====================================================

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para school_settings (solo lectura para todos los usuarios autenticados)
CREATE POLICY "Authenticated users can view school settings" ON school_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify school settings" ON school_settings FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para courses
CREATE POLICY "Authenticated users can view courses" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify courses" ON courses FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para students
CREATE POLICY "Authenticated users can view students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can modify students" ON students FOR ALL TO authenticated USING (true);

-- Políticas para schedules
CREATE POLICY "Authenticated users can view schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify schedules" ON schedules FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para payments
CREATE POLICY "Authenticated users can view payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Only admins can modify payments" ON payments FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para cash_cuts
CREATE POLICY "Authenticated users can view cash cuts" ON cash_cuts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create cash cuts" ON cash_cuts FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para attendance
CREATE POLICY "Authenticated users can view attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can modify attendance" ON attendance FOR ALL TO authenticated USING (true);

-- Políticas para document_templates
CREATE POLICY "Authenticated users can view document templates" ON document_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify document templates" ON document_templates FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para issued_documents
CREATE POLICY "Authenticated users can view issued documents" ON issued_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create issued documents" ON issued_documents FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para audit_log
CREATE POLICY "Only admins can view audit log" ON audit_log FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas que tienen updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_settings_updated_at BEFORE UPDATE ON school_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar números de recibo automáticamente
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := 'REC-' || TO_CHAR(NEW.payment_date, 'YYYYMMDD') || '-' || LPAD(nextval('receipt_sequence')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear secuencia para números de recibo
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Aplicar trigger para generar números de recibo
CREATE TRIGGER generate_receipt_number_trigger BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar configuración inicial de la escuela
INSERT INTO school_settings (school_name, school_code, address, phone, email) 
VALUES (
    'Instituto Polanco',
    'INSTITUTO_POLANCO',
    'Dirección del Instituto Polanco',
    '+52 123 456 7890',
    'contacto@institutopolanco.edu.mx'
) ON CONFLICT DO NOTHING;

-- Insertar cursos de ejemplo
INSERT INTO courses (name, description, duration_months, price) VALUES
    ('Computación Básica', 'Curso introductorio de computación', 3, 1500.00),
    ('Programación Web', 'Desarrollo de sitios web con HTML, CSS y JavaScript', 6, 3000.00),
    ('Diseño Gráfico', 'Curso de diseño gráfico con herramientas profesionales', 4, 2500.00),
    ('Administración de Empresas', 'Fundamentos de administración empresarial', 8, 4000.00),
    ('Inglés Básico', 'Curso de inglés nivel principiante', 5, 2000.00)
ON CONFLICT DO NOTHING;

-- Insertar plantillas de documentos básicas
INSERT INTO document_templates (name, type, template_html) VALUES
    ('Recibo de Pago Estándar', 'receipt', '<html><body><h1>Instituto Polanco</h1><p>Recibo de Pago</p></body></html>'),
    ('Certificado de Estudios', 'certificate', '<html><body><h1>Instituto Polanco</h1><p>Certificado de Estudios</p></body></html>')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- Script completado para Instituto Polanco
-- Base de datos: asqymroylemsrrmfwako.supabase.co
-- Todas las tablas, relaciones y configuraciones han sido creadas
-- El sistema está listo para ser utilizado
-- =====================================================

COMMIT;
