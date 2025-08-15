-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `goalId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_goalId_fkey` FOREIGN KEY (`goalId`) REFERENCES `goals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
