-- Script para actualizar valores NULL en opening_hour y closing_hour
UPDATE "Site"
SET
  "opening_hour" = COALESCE("opening_hour", '08:00'),
  "closing_hour" = COALESCE("closing_hour", '18:00')
WHERE "opening_hour" IS NULL OR "closing_hour" IS NULL;