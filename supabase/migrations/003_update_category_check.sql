ALTER TABLE transactions DROP CONSTRAINT transactions_category_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_category_check
  CHECK (category IN ('Comida','Supermercado','Transporte','Salud','Entretenimiento','Compras','Hogar','Trabajo','Otro'));
