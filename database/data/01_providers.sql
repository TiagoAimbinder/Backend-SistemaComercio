/* =========================================================================
   Carga inicial de PROVEEDORES (migración del sistema anterior) - PostgreSQL
   -------------------------------------------------------------------------
   Origen: database/proveedores.md (20 registros) -> se cargan 19.
   - Se mantienen los ids originales (los productos los referencian).
   - Idempotente: si el proveedor ya existe (mismo id) se actualiza.
   - Ajustes sobre el origen:
       * 192 "."      -> "SIN ASIGNAR" (tiene 80 productos; renombrar desde el front)
       * 201 PASCUAL  -> unificado con 210 PASCUAL (mismo nombre; sus 5 productos pasan al 210)
       * Teléfonos de relleno (+54 9 11 1111 ...) y el email a@gmail.com -> NULL
       * Emails en minúscula y nombres sin espacios de más
   Ejecutar después de schema.sql y seed.sql.
   ========================================================================= */

BEGIN;

INSERT INTO "Provider" (prov_id, prov_name, prov_email, prov_phone, prov_active)
VALUES
    (192, 'SIN ASIGNAR', NULL, NULL, TRUE),
    (193, 'ARRODIMEZ', 'arrodimez@gmail.com', NULL, TRUE),
    (194, 'VCC', 'vcc@gmail.com', NULL, TRUE),
    (195, 'COCA COLA', 'cocacola@gmail.com', NULL, TRUE),
    (196, 'BORLA', 'borla@gmail.com', NULL, TRUE),
    (197, 'PABLO VENANZETTI', 'pablo@gmail.com', NULL, TRUE),
    (198, 'GRANIX', 'granix@gmail.com', NULL, TRUE),
    (199, 'FISSGAR', 'fissgar@gmail.com', NULL, TRUE),
    (200, 'MARTINEZ', 'martinez@gmail.com', NULL, TRUE),
    (202, 'MANI KING', 'maniking@gmail.com', NULL, TRUE),
    (203, 'VARIOS', 'varios@gmail.com', NULL, TRUE),
    (204, 'ADRIANITA', 'adrianita@gmail.com', NULL, TRUE),
    (207, 'MASSO', 'masso@gmail.com', NULL, TRUE),
    (208, 'DISPLAY SRL', 'displaysrl1@gmail.com', '+54 353 489 9353', TRUE),
    (209, 'DISTRIBUIDORA FESTINI', 'festini@gmail.com', NULL, TRUE),
    (210, 'PASCUAL', 'pascual@gmail.com', '+54 3537 41 7695', TRUE),
    (212, 'BOCATO DISTRIBUCIONES', 'bocatodistribuciones@gmail.com', NULL, TRUE),
    (213, 'HANKS', 'hanks@gmail.com', NULL, TRUE),
    (214, 'LA PACHA', 'lapacha@gmail.com', NULL, TRUE)
ON CONFLICT (prov_id) DO UPDATE SET
    prov_name   = EXCLUDED.prov_name,
    prov_email  = EXCLUDED.prov_email,
    prov_phone  = EXCLUDED.prov_phone,
    prov_active = TRUE;

-- Los ids se cargaron a mano: el contador sigue desde el mayor
SELECT setval(pg_get_serial_sequence('"Provider"', 'prov_id'), (SELECT MAX(prov_id) FROM "Provider"));

COMMIT;

SELECT prov_id, prov_name, prov_email, prov_phone FROM "Provider" ORDER BY prov_id;
