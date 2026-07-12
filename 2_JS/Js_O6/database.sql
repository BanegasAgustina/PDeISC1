-- ============================================================
-- database.sql - Script de inicialización de la base de datos
-- ============================================================
-- Ejecutar este archivo en phpMyAdmin o en la consola de MySQL
-- antes de arrancar el servidor por primera vez.
-- El servidor también crea la tabla automáticamente si no existe,
-- pero este script es útil para resetear o revisar la estructura.

-- Crea la base de datos si no existe. Se usa en la configuración de db.js.
CREATE DATABASE IF NOT EXISTS Score;

-- Selecciona la base de datos para las siguientes instrucciones
USE Score;

-- Crea la tabla de puntajes con todas sus columnas.
-- IF NOT EXISTS evita error si ya fue creada previamente.
CREATE TABLE IF NOT EXISTS score (
  id         INT AUTO_INCREMENT PRIMARY KEY,  -- Identificador único auto-incremental
  nombre     VARCHAR(100) NOT NULL,           -- Nombre del jugador (máx. 100 caracteres)
  tiempo     TIME         NOT NULL,           -- Tiempo de la partida en formato HH:MM:SS
  puntos     INT          NOT NULL,           -- Puntaje calculado al final de la partida
  fecha      DATE         NOT NULL,           -- Fecha de la partida en formato YYYY-MM-DD
  categoria  VARCHAR(40)  NOT NULL DEFAULT 'General',  -- Categoría elegida (ej: "Animales")
  dificultad VARCHAR(20)  NOT NULL DEFAULT 'Media',    -- Dificultad elegida (Facil/Media/Dificil)
  resultado  VARCHAR(20)  NOT NULL DEFAULT 'Perdio'    -- Resultado de la partida (Gano/Perdio)
);

-- Agrega las columnas nuevas si la tabla ya existía sin ellas
-- (útil para actualizar bases de datos creadas con versiones anteriores del juego).
-- ADD COLUMN IF NOT EXISTS solo funciona en MariaDB; en MySQL puro usar el server.js para esto.
ALTER TABLE score
  ADD COLUMN IF NOT EXISTS categoria  VARCHAR(40) NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS dificultad VARCHAR(20) NOT NULL DEFAULT 'Media',
  ADD COLUMN IF NOT EXISTS resultado  VARCHAR(20) NOT NULL DEFAULT 'Perdio';
