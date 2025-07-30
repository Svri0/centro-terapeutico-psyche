-- Script para configurar la base de datos del Centro Terapéutico Psyche
-- Ejecutar en pgAdmin o psql

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE psyche_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'psyche_db')\gexec

-- Conectar a la base de datos
\c psyche_db;

-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar que la base de datos se creó correctamente
SELECT current_database() as "Base de datos actual";

-- Mostrar información de la base de datos
SELECT 
    datname as "Nombre",
    pg_size_pretty(pg_database_size(datname)) as "Tamaño",
    pg_get_userbyid(datdba) as "Propietario"
FROM pg_database 
WHERE datname = 'psyche_db'; 