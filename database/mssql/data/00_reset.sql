/* =========================================================================
   RESET DE DATOS - borra TODOS los registros y deja las tablas vacías
   -------------------------------------------------------------------------
   - Mantiene el esquema intacto (constraints, índices filtrados, columnas calculadas).
   - Conserva los catálogos Role y PaymentMethod (los repone seed.sql si faltan).
   - Reinicia los IDENTITY para que los próximos ids arranquen de 1.
   - Borra en orden inverso a las FK (hijos primero).
   ⚠ No se puede deshacer. Ejecutar solo en local / dev.
   Después: data/01_providers.sql, data/02_products.sql, ...
   ========================================================================= */

SET NOCOUNT ON;
BEGIN TRANSACTION;

DELETE FROM SalePayment;
DELETE FROM SaleXProduct;
DELETE FROM Sale;
DELETE FROM CashMovement;
DELETE FROM CashRegister;
DELETE FROM Product;
DELETE FROM Provider;
DELETE FROM [User];

DBCC CHECKIDENT ('SalePayment',  RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('Sale',         RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('CashMovement', RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('CashRegister', RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('Product',      RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('Provider',     RESEED, 0) WITH NO_INFOMSGS;
DBCC CHECKIDENT ('[User]',       RESEED, 0) WITH NO_INFOMSGS;

COMMIT TRANSACTION;

SELECT 'Provider' AS tabla, COUNT(*) AS filas FROM Provider
UNION ALL SELECT 'Product', COUNT(*) FROM Product
UNION ALL SELECT 'CashRegister', COUNT(*) FROM CashRegister
UNION ALL SELECT 'Sale', COUNT(*) FROM Sale
UNION ALL SELECT 'User', COUNT(*) FROM [User];
