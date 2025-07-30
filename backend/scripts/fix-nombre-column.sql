-- Script para corregir el nombre de la columna de 'nombres' a 'nombre'
-- Ejecutar en pgAdmin o psql

-- Verificar si la columna 'nombres' existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'nombres'
    ) THEN
        -- Renombrar la columna de 'nombres' a 'nombre'
        ALTER TABLE usuarios RENAME COLUMN nombres TO nombre;
        RAISE NOTICE 'Columna renombrada exitosamente de "nombres" a "nombre"';
    ELSE
        RAISE NOTICE 'La columna "nombres" no existe, posiblemente ya fue renombrada';
    END IF;
END $$; 