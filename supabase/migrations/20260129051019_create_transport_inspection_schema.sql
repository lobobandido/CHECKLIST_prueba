/*
  # Transport Inspection Management System - Database Schema

  ## Overview
  Complete database schema for managing vehicle inspections with multimedia evidence,
  digital signatures, and role-based access control.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - 'admin', 'supervisor', 'driver'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. vehicle_types
  - `id` (uuid, primary key)
  - `name` (text) - 'Tractocamión', 'Caja seca', 'Camioneta', 'Dolly', 'Contenedor'
  - `description` (text)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ### 3. inspection_parts
  - `id` (uuid, primary key)
  - `name` (text) - 'Espejos', 'Llantas', 'Puertas', etc.
  - `description` (text)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ### 4. vehicle_type_parts
  - `id` (uuid, primary key)
  - `vehicle_type_id` (uuid, references vehicle_types)
  - `inspection_part_id` (uuid, references inspection_parts)
  - Mapping table for which parts apply to which vehicle types

  ### 5. vehicles
  - `id` (uuid, primary key)
  - `vehicle_type_id` (uuid, references vehicle_types)
  - `unit_number` (text, unique)
  - `license_plate` (text)
  - `brand` (text)
  - `model` (text)
  - `year` (integer)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ### 6. inspections
  - `id` (uuid, primary key)
  - `folio` (text, unique) - Auto-generated consecutive number
  - `vehicle_id` (uuid, references vehicles)
  - `inspection_type` (text) - 'departure' or 'return'
  - `inspector_id` (uuid, references profiles)
  - `driver_id` (uuid, references profiles)
  - `status` (text) - 'in_progress', 'completed'
  - `inspector_signature` (text) - Base64 data URL
  - `driver_signature` (text) - Base64 data URL
  - `observations` (text)
  - `inspection_date` (timestamptz)
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 7. inspection_items
  - `id` (uuid, primary key)
  - `inspection_id` (uuid, references inspections)
  - `inspection_part_id` (uuid, references inspection_parts)
  - `status` (text) - 'no_damage', 'damaged', 'not_applicable'
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 8. inspection_evidence
  - `id` (uuid, primary key)
  - `inspection_id` (uuid, references inspections)
  - `file_path` (text) - Path in Supabase Storage
  - `file_type` (text) - 'image' or 'video'
  - `file_name` (text)
  - `file_size` (bigint)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies for role-based access (admin, supervisor, driver)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'supervisor', 'driver')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create vehicle_types table
CREATE TABLE IF NOT EXISTS vehicle_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;

-- Create inspection_parts table
CREATE TABLE IF NOT EXISTS inspection_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inspection_parts ENABLE ROW LEVEL SECURITY;

-- Create vehicle_type_parts mapping table
CREATE TABLE IF NOT EXISTS vehicle_type_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type_id uuid REFERENCES vehicle_types(id) ON DELETE CASCADE,
  inspection_part_id uuid REFERENCES inspection_parts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vehicle_type_id, inspection_part_id)
);

ALTER TABLE vehicle_type_parts ENABLE ROW LEVEL SECURITY;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type_id uuid REFERENCES vehicle_types(id) NOT NULL,
  unit_number text UNIQUE NOT NULL,
  license_plate text,
  brand text,
  model text,
  year integer,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  inspection_type text NOT NULL CHECK (inspection_type IN ('departure', 'return')),
  inspector_id uuid REFERENCES profiles(id) NOT NULL,
  driver_id uuid REFERENCES profiles(id),
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  inspector_signature text,
  driver_signature text,
  observations text,
  inspection_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Create inspection_items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
  inspection_part_id uuid REFERENCES inspection_parts(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('no_damage', 'damaged', 'not_applicable')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- Create inspection_evidence table
CREATE TABLE IF NOT EXISTS inspection_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name text NOT NULL,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inspection_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for vehicle_types
CREATE POLICY "Anyone authenticated can view vehicle types"
  ON vehicle_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage vehicle types"
  ON vehicle_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for inspection_parts
CREATE POLICY "Anyone authenticated can view inspection parts"
  ON inspection_parts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage inspection parts"
  ON inspection_parts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for vehicle_type_parts
CREATE POLICY "Anyone authenticated can view vehicle type parts"
  ON vehicle_type_parts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage vehicle type parts"
  ON vehicle_type_parts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for vehicles
CREATE POLICY "Anyone authenticated can view vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and supervisors can manage vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- RLS Policies for inspections
CREATE POLICY "Users can view inspections they're involved in"
  ON inspections FOR SELECT
  TO authenticated
  USING (
    inspector_id = auth.uid() OR 
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Supervisors and admins can create inspections"
  ON inspections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Inspectors can update their own inspections"
  ON inspections FOR UPDATE
  TO authenticated
  USING (
    inspector_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    inspector_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete inspections"
  ON inspections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for inspection_items
CREATE POLICY "Users can view inspection items for their inspections"
  ON inspection_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE id = inspection_items.inspection_id
      AND (
        inspector_id = auth.uid() OR 
        driver_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
        )
      )
    )
  );

CREATE POLICY "Inspectors can manage items for their inspections"
  ON inspection_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE id = inspection_items.inspection_id
      AND (
        inspector_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE id = inspection_items.inspection_id
      AND (
        inspector_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- RLS Policies for inspection_evidence
CREATE POLICY "Users can view evidence for their inspections"
  ON inspection_evidence FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE id = inspection_evidence.inspection_id
      AND (
        inspector_id = auth.uid() OR 
        driver_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
        )
      )
    )
  );

CREATE POLICY "Inspectors can manage evidence for their inspections"
  ON inspection_evidence FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE id = inspection_evidence.inspection_id
      AND (
        inspector_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE id = inspection_evidence.inspection_id
      AND (
        inspector_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Function to generate consecutive folio
CREATE OR REPLACE FUNCTION generate_folio()
RETURNS text AS $$
DECLARE
  next_number integer;
  new_folio text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(folio FROM '[0-9]+') AS integer)), 0) + 1
  INTO next_number
  FROM inspections;
  
  new_folio := 'INS-' || LPAD(next_number::text, 6, '0');
  RETURN new_folio;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate folio
CREATE OR REPLACE FUNCTION set_inspection_folio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    NEW.folio := generate_folio();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_inspection_folio
  BEFORE INSERT ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION set_inspection_folio();

-- Insert default vehicle types
INSERT INTO vehicle_types (name, description) VALUES
  ('Tractocamión', 'Vehículo motorizado diseñado para arrastrar semirremolques'),
  ('Caja seca', 'Remolque cerrado para transporte de carga general'),
  ('Camioneta', 'Vehículo ligero de carga'),
  ('Dolly', 'Convertidor de remolque'),
  ('Contenedor', 'Unidad de carga intermodal')
ON CONFLICT (name) DO NOTHING;

-- Insert default inspection parts
INSERT INTO inspection_parts (name, description, display_order) VALUES
  ('Espejos', 'Espejos retrovisores laterales y central', 1),
  ('Llantas', 'Estado de neumáticos y presión', 2),
  ('Puertas', 'Puertas de cabina y caja de carga', 3),
  ('Cofre', 'Capó del motor', 4),
  ('Defensa', 'Defensas delantera y trasera', 5),
  ('Salpicaderas', 'Guardafangos y protecciones laterales', 6),
  ('Golpes visibles', 'Daños externos y abolladuras', 7),
  ('Luces', 'Faros, direccionales y luces de freno', 8),
  ('Parabrisas', 'Estado del cristal frontal', 9),
  ('Condiciones generales', 'Estado general de limpieza y mantenimiento', 10)
ON CONFLICT (name) DO NOTHING;

-- Link all parts to all vehicle types by default
INSERT INTO vehicle_type_parts (vehicle_type_id, inspection_part_id)
SELECT vt.id, ip.id
FROM vehicle_types vt
CROSS JOIN inspection_parts ip
ON CONFLICT (vehicle_type_id, inspection_part_id) DO NOTHING;