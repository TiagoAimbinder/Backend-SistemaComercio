/* =========================================================================
   Datos iniciales de catálogos. Ejecutar después de schema.sql.
   Es idempotente: solo inserta lo que falta.
   ========================================================================= */

BEGIN;

INSERT INTO "Role" (rol_name)
VALUES ('Gerente'), ('Cajero')
ON CONFLICT (rol_name) DO NOTHING;

INSERT INTO "PaymentMethod" (pm_code, pm_name, pm_group)
VALUES
    ('efectivo',      'Efectivo',      'efectivo'),
    ('debito',        'Débito',        'tarjeta'),
    ('credito',       'Crédito',       'tarjeta'),
    ('qr',            'QR',            'digital'),
    ('transferencia', 'Transferencia', 'digital')
ON CONFLICT (pm_code) DO NOTHING;

COMMIT;
