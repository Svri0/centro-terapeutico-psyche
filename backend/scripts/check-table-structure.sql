-- Script para verificar la estructura de la tabla usuarios
-- Ejecutar en pgAdmin

-- Verificar si la tabla existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'usuarios';

-- Verificar las columnas de la tabla usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_usuarios FROM usuarios; 