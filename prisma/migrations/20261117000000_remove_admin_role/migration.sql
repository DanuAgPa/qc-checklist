-- 1. Update semua user ber-role ADMIN menjadi TESTER (tanpa kenaikan hak akses yang tidak disengaja)
UPDATE "User" SET role = 'TESTER' WHERE role = 'ADMIN';

-- 2. Buat tipe enum baru tanpa ADMIN
CREATE TYPE "Role_new" AS ENUM ('TESTER', 'PRODUCT_MANAGER');

-- 3. Ubah kolom role ke tipe baru
ALTER TABLE "User" ALTER COLUMN role TYPE "Role_new" USING role::text::"Role_new";

-- 4. Hapus tipe enum lama
DROP TYPE "Role";

-- 5. Ganti nama tipe baru menjadi "Role"
ALTER TYPE "Role_new" RENAME TO "Role";
