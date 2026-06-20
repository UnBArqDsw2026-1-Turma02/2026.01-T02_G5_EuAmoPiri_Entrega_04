-- Adiciona papel ADMIN ao enum AccountType.
-- Contas admin não podem ser criadas via cadastro público; promova manualmente, ex.:
--   UPDATE "User" SET "accountType" = 'ADMIN' WHERE email = 'admin@exemplo.com';
ALTER TYPE "AccountType" ADD VALUE 'ADMIN';
