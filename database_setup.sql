-- Sistema Escolar AvanzaCdDelCarmen - Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create school_settings table
CREATE TABLE IF NOT EXISTS school_settings (
    id SERIAL PRIMARY KEY,
    school_name TEXT DEFAULT 'AvanzaCdDelCarmen',
    school_address TEXT,
    school_phone TEXT,
    school_email TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '262, 83%, 58%',
    background_theme TEXT DEFAULT 'default',
    notifications_overdue_payments BOOLEAN DEFAULT true,
    notifications_upcoming_payments BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    instructor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    course TEXT,
    status TEXT DEFAULT 'active', -- active, inactive, graduated, suspended
    status_notes TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    schedule_id INTEGER REFERENCES schedules(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    concept TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, overdue
    due_date DATE,
    paid_date DATE,
    created_date DATE DEFAULT CURRENT_DATE,
    debt_amount DECIMAL(10,2),
    cash_cut_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cash_cuts table
CREATE TABLE IF NOT EXISTS cash_cuts (
    id SERIAL PRIMARY KEY,
    cut_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_count INTEGER NOT NULL,
    details JSONB, -- Store breakdown and payment IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- certificate, diploma, transcript, etc.
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issued_documents table
CREATE TABLE IF NOT EXISTS issued_documents (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES document_templates(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    status TEXT DEFAULT 'issued', -- issued, revoked
    folio TEXT UNIQUE NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT DEFAULT 'present', -- present, absent, late
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, schedule_id, date)
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_schedule ON attendance(student_id, schedule_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Insert default school settings
INSERT INTO school_settings (
    school_name, 
    school_email,
    notifications_overdue_payments,
    notifications_upcoming_payments
) VALUES (
    'AvanzaCdDelCarmen',
    'admin@avanzasystemcdobregon.cloud',
    true,
    true
) ON CONFLICT DO NOTHING;

-- Insert some sample courses
INSERT INTO courses (name, description, duration, price) VALUES 
    ('Computación Básica', 'Curso introductorio de computación', '3 meses', 1500.00),
    ('Ofimática Avanzada', 'Microsoft Office avanzado', '2 meses', 1200.00),
    ('Diseño Gráfico', 'Photoshop e Illustrator', '4 meses', 2000.00),
    ('Programación Web', 'HTML, CSS, JavaScript', '6 meses', 3000.00)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow authenticated users to access all data for now)
-- You can make these more restrictive based on roles later

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- School settings policies
CREATE POLICY "Users can view school settings" ON school_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update school settings" ON school_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- General policies for other tables (allow all operations for authenticated users)
CREATE POLICY "Authenticated users can access courses" ON courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access schedules" ON schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access students" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access cash_cuts" ON cash_cuts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access document_templates" ON document_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access issued_documents" ON issued_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access attendance" ON attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access audit_log" ON audit_log FOR ALL USING (auth.role() = 'authenticated');

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_school_settings_updated_at BEFORE UPDATE ON school_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cash_cuts_updated_at BEFORE UPDATE ON cash_cuts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_issued_documents_updated_at BEFORE UPDATE ON issued_documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully! You can now use your school management system.' as status;
