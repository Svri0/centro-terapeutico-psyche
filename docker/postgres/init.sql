-- Script de inicialización de la base de datos
-- Centro Terapéutico Psyche

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS psyche_db;

-- Conectar a la base de datos
\c psyche_db;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comentario sobre el proyecto
COMMENT ON DATABASE psyche_db IS 'Base de datos del Sistema de Gestión Terapéutico Psyche';

-- Nota: Las tablas se crearán mediante migraciones de Sequelize 