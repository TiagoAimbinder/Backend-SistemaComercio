/* =========================================================================
   RESET DE DATOS - borra TODOS los registros y deja las tablas vacías
   -------------------------------------------------------------------------
   - Mantiene el esquema intacto (constraints, índices parciales, columnas calculadas).
   - Conserva los catálogos Role y PaymentMethod (seed.sql los repone si faltan).
   - RESTART IDENTITY: los próximos ids vuelven a arrancar en 1
     (los proveedores y productos migrados conservan sus ids originales).
   ⚠ No se puede deshacer. Ejecutar solo en local / dev.
   Después: data/01_providers.sql, data/02_products.sql
   ========================================================================= */

BEGIN;

TRUNCATE TABLE
    "SalePayment", "SaleXProduct", "Sale",
    "CashMovement", "CashRegister",
    "Product", "Provider", "User"
RESTART IDENTITY;

COMMIT;

SELECT 'Provider' AS tabla, COUNT(*) AS filas FROM "Provider"
UNION ALL SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL SELECT 'CashRegister', COUNT(*) FROM "CashRegister"
UNION ALL SELECT 'Sale', COUNT(*) FROM "Sale"
UNION ALL SELECT 'User', COUNT(*) FROM "User";
