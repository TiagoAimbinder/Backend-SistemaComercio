/* =========================================================================
   Datos iniciales de catálogos. Ejecutar después de schema.sql.
   Es idempotente: solo inserta lo que falta.
   ========================================================================= */

MERGE Role AS t
USING (VALUES ('Gerente'), ('Cajero')) AS s (rol_name)
    ON t.rol_name = s.rol_name
WHEN NOT MATCHED THEN INSERT (rol_name) VALUES (s.rol_name);
GO

MERGE PaymentMethod AS t
USING (VALUES
    ('efectivo',      N'Efectivo',      'efectivo'),
    ('debito',        N'Débito',        'tarjeta'),
    ('credito',       N'Crédito',       'tarjeta'),
    ('qr',            N'QR',            'digital'),
    ('transferencia', N'Transferencia', 'digital')
) AS s (pm_code, pm_name, pm_group)
    ON t.pm_code = s.pm_code
WHEN NOT MATCHED THEN INSERT (pm_code, pm_name, pm_group) VALUES (s.pm_code, s.pm_name, s.pm_group);
GO
