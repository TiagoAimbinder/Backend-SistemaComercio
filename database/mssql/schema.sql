/* =========================================================================
   Sistema de Kiosco - Esquema de base de datos (SQL Server)
   -------------------------------------------------------------------------
   Fuente de verdad del esquema: este script (el DER es la referencia).
   La API NO sincroniza tablas (Sequelize sync desactivado), así se conservan
   columnas calculadas, índices filtrados y CHECKs que el ORM no maneja.

   Uso: ejecutar sobre una base vacía (SSMS o sqlcmd). Luego correr seed.sql.
   Convenciones:
     - Tablas en singular PascalCase; columnas con prefijo de tabla.
     - Fechas DATETIME2(0) en UTC. Dinero en DECIMAL.
     - Baja lógica con *_active; ninguna FK usa CASCADE.
     - Constraints con nombre explícito (PK_, FK_, UQ_, CK_, IX_).
   ========================================================================= */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ============================== USUARIOS ============================== */

CREATE TABLE Role (
    rol_id      TINYINT IDENTITY(1,1) NOT NULL,
    rol_name    VARCHAR(20)           NOT NULL,
    CONSTRAINT PK_Role PRIMARY KEY (rol_id),
    CONSTRAINT UQ_Role_Name UNIQUE (rol_name)
);
GO

-- [User] es palabra reservada: siempre entre corchetes.
CREATE TABLE [User] (
    usu_id              INT IDENTITY(1,1) NOT NULL,
    rol_id              TINYINT           NOT NULL,
    usu_name            NVARCHAR(100)     NOT NULL,
    usu_username        VARCHAR(50)       NOT NULL,
    usu_hash_password   VARCHAR(255)      NOT NULL,
    usu_active          BIT               NOT NULL CONSTRAINT DF_User_Active DEFAULT (1),
    usu_last_login_at   DATETIME2(0)      NULL,
    createdAt           DATETIME2(0)      NOT NULL CONSTRAINT DF_User_CreatedAt DEFAULT (SYSUTCDATETIME()),
    updatedAt           DATETIME2(0)      NULL,
    CONSTRAINT PK_User PRIMARY KEY (usu_id),
    CONSTRAINT UQ_User_Username UNIQUE (usu_username),
    CONSTRAINT FK_User_Role FOREIGN KEY (rol_id) REFERENCES Role (rol_id)
);
GO

CREATE INDEX IX_User_RolId ON [User] (rol_id);
GO

/* ============================= PROVEEDORES ============================ */

CREATE TABLE Provider (
    prov_id      INT IDENTITY(1,1) NOT NULL,
    prov_name    NVARCHAR(150)     NOT NULL,
    prov_email   NVARCHAR(254)     NULL,
    prov_phone   VARCHAR(30)       NULL,
    prov_active  BIT               NOT NULL CONSTRAINT DF_Provider_Active DEFAULT (1),
    CONSTRAINT PK_Provider PRIMARY KEY (prov_id),
    CONSTRAINT UQ_Provider_Name UNIQUE (prov_name),
    CONSTRAINT CK_Provider_Email CHECK (prov_email IS NULL OR prov_email LIKE '%_@_%._%')
);
GO

/* ============================== PRODUCTOS ============================= */

CREATE TABLE Product (
    prod_id       INT IDENTITY(1,1) NOT NULL,
    prov_id       INT               NOT NULL,
    prod_barcode  VARCHAR(50)       NULL,
    prod_name     NVARCHAR(150)     NOT NULL,
    prod_cost     DECIMAL(10,2)     NOT NULL CONSTRAINT DF_Product_Cost DEFAULT (0),
    prod_price    DECIMAL(10,2)     NOT NULL,
    prod_stock    INT               NOT NULL CONSTRAINT DF_Product_Stock DEFAULT (0), -- admite negativos
    prod_active   BIT               NOT NULL CONSTRAINT DF_Product_Active DEFAULT (1),
    createdAt     DATETIME2(0)      NOT NULL CONSTRAINT DF_Product_CreatedAt DEFAULT (SYSUTCDATETIME()),
    updatedAt     DATETIME2(0)      NULL,
    CONSTRAINT PK_Product PRIMARY KEY (prod_id),
    CONSTRAINT FK_Product_Provider FOREIGN KEY (prov_id) REFERENCES Provider (prov_id),
    CONSTRAINT CK_Product_Cost  CHECK (prod_cost  >= 0),
    CONSTRAINT CK_Product_Price CHECK (prod_price >= 0)
);
GO

CREATE INDEX IX_Product_ProvId ON Product (prov_id);
-- Un UNIQUE común admite un solo NULL: el índice filtrado permite muchos productos sin código.
CREATE UNIQUE INDEX UQ_Product_Barcode ON Product (prod_barcode) WHERE prod_barcode IS NOT NULL;
GO

/* =========================== MEDIOS DE PAGO =========================== */

CREATE TABLE PaymentMethod (
    pm_id      TINYINT IDENTITY(1,1) NOT NULL,
    pm_code    VARCHAR(20)           NOT NULL,
    pm_name    NVARCHAR(50)          NOT NULL,
    pm_group   VARCHAR(10)           NOT NULL,
    pm_active  BIT                   NOT NULL CONSTRAINT DF_PaymentMethod_Active DEFAULT (1),
    CONSTRAINT PK_PaymentMethod PRIMARY KEY (pm_id),
    CONSTRAINT UQ_PaymentMethod_Code UNIQUE (pm_code),
    CONSTRAINT CK_PaymentMethod_Group CHECK (pm_group IN ('efectivo', 'tarjeta', 'digital'))
);
GO

/* ================================ CAJA ================================ */

CREATE TABLE CashRegister (
    cash_id                  INT IDENTITY(1,1) NOT NULL,
    user_id                  INT               NOT NULL,
    cash_opened_at           DATETIME2(0)      NOT NULL CONSTRAINT DF_CashRegister_OpenedAt DEFAULT (SYSUTCDATETIME()),
    cash_scheduled_close_at  DATETIME2(0)      NOT NULL,
    cash_closed_at           DATETIME2(0)      NULL,
    cash_close_type          VARCHAR(10)       NULL,
    cash_initial_fund        DECIMAL(12,2)     NOT NULL,
    cash_counted_cash        DECIMAL(12,2)     NULL,
    cash_status AS (CASE WHEN cash_closed_at IS NULL THEN 'open' ELSE 'closed' END),
    CONSTRAINT PK_CashRegister PRIMARY KEY (cash_id),
    CONSTRAINT FK_CashRegister_User FOREIGN KEY (user_id) REFERENCES [User] (usu_id),
    CONSTRAINT CK_CashRegister_ScheduledClose CHECK (cash_scheduled_close_at > cash_opened_at),
    CONSTRAINT CK_CashRegister_CloseType CHECK (cash_close_type IS NULL OR cash_close_type IN ('auto', 'manual')),
    CONSTRAINT CK_CashRegister_InitialFund CHECK (cash_initial_fund >= 0),
    CONSTRAINT CK_CashRegister_CountedCash CHECK (cash_counted_cash IS NULL OR cash_counted_cash >= 0),
    -- Abierta: sin datos de cierre. Cerrada: fecha y tipo de cierre cargados.
    CONSTRAINT CK_CashRegister_CloseState CHECK (
        (cash_closed_at IS NULL AND cash_close_type IS NULL AND cash_counted_cash IS NULL)
        OR (cash_closed_at IS NOT NULL AND cash_close_type IS NOT NULL)
    ),
    -- Arqueo: obligatorio en cierre manual, vacío en cierre automático.
    CONSTRAINT CK_CashRegister_CountedByType CHECK (
        cash_close_type IS NULL
        OR (cash_close_type = 'manual' AND cash_counted_cash IS NOT NULL)
        OR (cash_close_type = 'auto'   AND cash_counted_cash IS NULL)
    )
);
GO

CREATE INDEX IX_CashRegister_UserId   ON CashRegister (user_id);
CREATE INDEX IX_CashRegister_OpenedAt ON CashRegister (cash_opened_at);
-- Una sola caja abierta por usuario (varias terminales en simultáneo).
CREATE UNIQUE INDEX UQ_CashRegister_OpenPerUser ON CashRegister (user_id) WHERE cash_closed_at IS NULL;
GO

CREATE TABLE CashMovement (
    mov_id        INT IDENTITY(1,1) NOT NULL,
    cash_id       INT               NOT NULL,
    prov_id       INT               NULL,
    mov_type      VARCHAR(10)       NOT NULL,
    mov_category  VARCHAR(20)       NOT NULL,
    mov_amount    DECIMAL(12,2)     NOT NULL,
    mov_method    VARCHAR(15)       NOT NULL,
    mov_desc      NVARCHAR(255)     NULL,
    createdAt     DATETIME2(0)      NOT NULL CONSTRAINT DF_CashMovement_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_CashMovement PRIMARY KEY (mov_id),
    CONSTRAINT FK_CashMovement_CashRegister FOREIGN KEY (cash_id) REFERENCES CashRegister (cash_id),
    CONSTRAINT FK_CashMovement_Provider FOREIGN KEY (prov_id) REFERENCES Provider (prov_id),
    CONSTRAINT CK_CashMovement_Type CHECK (mov_type IN ('ingreso', 'egreso')),
    CONSTRAINT CK_CashMovement_Category CHECK (
        (mov_type = 'egreso'  AND mov_category IN ('pago_proveedor', 'gasto_menor'))
        OR (mov_type = 'ingreso' AND mov_category IN ('ingreso_efectivo', 'otro_ingreso'))
    ),
    CONSTRAINT CK_CashMovement_Amount CHECK (mov_amount > 0),
    CONSTRAINT CK_CashMovement_Method CHECK (mov_method IN ('efectivo', 'transferencia')),
    CONSTRAINT CK_CashMovement_Provider CHECK (prov_id IS NULL OR mov_category = 'pago_proveedor')
);
GO

CREATE INDEX IX_CashMovement_CashId ON CashMovement (cash_id);
CREATE INDEX IX_CashMovement_ProvId ON CashMovement (prov_id) WHERE prov_id IS NOT NULL;
GO

/* =============================== VENTAS =============================== */

CREATE TABLE Sale (
    sale_id             INT IDENTITY(1,1) NOT NULL,
    cash_id             INT               NOT NULL,
    sale_total          DECIMAL(12,2)     NOT NULL,
    sale_cash_received  DECIMAL(12,2)     NULL,
    sale_change_given   DECIMAL(12,2)     NOT NULL CONSTRAINT DF_Sale_ChangeGiven DEFAULT (0),
    sale_cancelled_at   DATETIME2(0)      NULL,
    sale_cancelled_by   INT               NULL,
    sale_status AS (CASE WHEN sale_cancelled_at IS NULL THEN 'completada' ELSE 'anulada' END),
    createdAt           DATETIME2(0)      NOT NULL CONSTRAINT DF_Sale_CreatedAt DEFAULT (SYSUTCDATETIME()),
    updatedAt           DATETIME2(0)      NULL,
    CONSTRAINT PK_Sale PRIMARY KEY (sale_id),
    CONSTRAINT FK_Sale_CashRegister FOREIGN KEY (cash_id) REFERENCES CashRegister (cash_id),
    CONSTRAINT FK_Sale_User FOREIGN KEY (sale_cancelled_by) REFERENCES [User] (usu_id),
    CONSTRAINT CK_Sale_Total CHECK (sale_total >= 0),
    CONSTRAINT CK_Sale_CashReceived CHECK (sale_cash_received IS NULL OR sale_cash_received >= 0),
    CONSTRAINT CK_Sale_ChangeGiven CHECK (sale_change_given >= 0),
    CONSTRAINT CK_Sale_ChangeNeedsCash CHECK (sale_cash_received IS NOT NULL OR sale_change_given = 0),
    CONSTRAINT CK_Sale_Cancellation CHECK (
        (sale_cancelled_at IS NULL AND sale_cancelled_by IS NULL)
        OR (sale_cancelled_at IS NOT NULL AND sale_cancelled_by IS NOT NULL)
    )
);
GO

CREATE INDEX IX_Sale_CashId ON Sale (cash_id) INCLUDE (sale_total, sale_cancelled_at);
CREATE INDEX IX_Sale_CreatedAt ON Sale (createdAt);
GO

CREATE TABLE SaleXProduct (
    sale_id         INT            NOT NULL,
    prod_id         INT            NOT NULL,
    sxp_prod_name   NVARCHAR(150)  NOT NULL, -- copia del nombre al vender
    sxp_quantity    INT            NOT NULL,
    sxp_unit_price  DECIMAL(10,2)  NOT NULL, -- copia del precio al vender
    sxp_subtotal AS (CAST(sxp_quantity * sxp_unit_price AS DECIMAL(12,2))) PERSISTED,
    CONSTRAINT PK_SaleXProduct PRIMARY KEY (sale_id, prod_id),
    CONSTRAINT FK_SaleXProduct_Sale FOREIGN KEY (sale_id) REFERENCES Sale (sale_id),
    CONSTRAINT FK_SaleXProduct_Product FOREIGN KEY (prod_id) REFERENCES Product (prod_id),
    CONSTRAINT CK_SaleXProduct_Quantity CHECK (sxp_quantity > 0),
    CONSTRAINT CK_SaleXProduct_UnitPrice CHECK (sxp_unit_price >= 0)
);
GO

CREATE INDEX IX_SaleXProduct_ProdId ON SaleXProduct (prod_id);
GO

CREATE TABLE SalePayment (
    sp_id      INT IDENTITY(1,1) NOT NULL,
    sale_id    INT               NOT NULL,
    pm_id      TINYINT           NOT NULL,
    sp_amount  DECIMAL(12,2)     NOT NULL, -- en efectivo: lo aplicado a la venta, no el billete
    CONSTRAINT PK_SalePayment PRIMARY KEY (sp_id),
    CONSTRAINT FK_SalePayment_Sale FOREIGN KEY (sale_id) REFERENCES Sale (sale_id),
    CONSTRAINT FK_SalePayment_PaymentMethod FOREIGN KEY (pm_id) REFERENCES PaymentMethod (pm_id),
    CONSTRAINT CK_SalePayment_Amount CHECK (sp_amount > 0)
);
GO

CREATE INDEX IX_SalePayment_SaleId ON SalePayment (sale_id);
CREATE INDEX IX_SalePayment_PmId   ON SalePayment (pm_id);
GO
