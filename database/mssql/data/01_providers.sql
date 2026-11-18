/* =========================================================================
   Carga inicial de PROVEEDORES (migración del sistema anterior)
   -------------------------------------------------------------------------
   Origen: database/proveedores.md (20 registros).
   - Se mantienen los ids originales (los productos los referencian).
   - Idempotente: si el proveedor ya existe (mismo id) se actualiza.
   - Ajustes sobre el origen:
       * 192 "."      -> "SIN ASIGNAR" (tiene 80 productos; renombrar desde el front)
       * 201 PASCUAL  -> unificado con 210 PASCUAL (mismo nombre; sus 5 productos pasan al 210)
       * Teléfonos de relleno (+54 9 11 1111 ...) y el email a@gmail.com -> NULL
       * Emails en minúscula y nombres sin espacios de más
   Ejecutar después de schema.sql y seed.sql.
   ========================================================================= */

SET NOCOUNT ON;
BEGIN TRANSACTION;

SET IDENTITY_INSERT Provider ON;

MERGE Provider AS t
USING (VALUES
    (192, N'SIN PROVEEDOR', NULL, NULL),
    (193, N'ARRODIMEZ', N'arrodimez@gmail.com', NULL),
    (194, N'VCC', N'vcc@gmail.com', NULL),
    (195, N'COCA COLA', N'cocacola@gmail.com', NULL),
    (196, N'BORLA', N'borla@gmail.com', NULL),
    (197, N'PABLO VENANZETTI', N'pablo@gmail.com', NULL),
    (198, N'GRANIX', N'granix@gmail.com', NULL),
    (199, N'FISSGAR', N'fissgar@gmail.com', NULL),
    (200, N'MARTINEZ', N'martinez@gmail.com', NULL),
    (202, N'MANI KING', N'maniking@gmail.com', NULL),
    (203, N'VARIOS', N'varios@gmail.com', NULL),
    (204, N'ADRIANITA', N'adrianita@gmail.com', NULL),
    (207, N'MASSO', N'masso@gmail.com', NULL),
    (208, N'DISPLAY SRL', N'displaysrl1@gmail.com', N'+54 353 489 9353'),
    (209, N'DISTRIBUIDORA FESTINI', N'festini@gmail.com', NULL),
    (210, N'PASCUAL', N'pascual@gmail.com', N'+54 3537 41 7695'),
    (212, N'BOCATO DISTRIBUCIONES', N'bocatodistribuciones@gmail.com', NULL),
    (213, N'HANKS', N'hanks@gmail.com', NULL),
    (214, N'LA PACHA', N'lapacha@gmail.com', NULL)
) AS s (prov_id, prov_name, prov_email, prov_phone)
    ON t.prov_id = s.prov_id
WHEN MATCHED THEN
    UPDATE SET prov_name = s.prov_name, prov_email = s.prov_email, prov_phone = s.prov_phone, prov_active = 1
WHEN NOT MATCHED THEN
    INSERT (prov_id, prov_name, prov_email, prov_phone, prov_active)
    VALUES (s.prov_id, s.prov_name, s.prov_email, s.prov_phone, 1);

SET IDENTITY_INSERT Provider OFF;

COMMIT TRANSACTION;

SELECT prov_id, prov_name, prov_email, prov_phone FROM Provider ORDER BY prov_id;
