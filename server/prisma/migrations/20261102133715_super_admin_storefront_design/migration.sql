-- AlterTable
ALTER TABLE `users` ADD COLUMN `permissions` JSON NULL,
    MODIFY `role` ENUM('CUSTOMER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `storefront_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `announcement` VARCHAR(191) NOT NULL DEFAULT 'Free delivery over ৳5,000',
    `heroEyebrow` VARCHAR(191) NOT NULL DEFAULT 'Aurora Cyber / 2026 collection',
    `heroTitle` VARCHAR(191) NOT NULL DEFAULT 'Tech that feels',
    `heroHighlight` VARCHAR(191) NOT NULL DEFAULT 'effortless',
    `heroDescription` VARCHAR(191) NOT NULL DEFAULT 'A tightly curated shelf of laptops, audio, displays and desk gear. Honest pricing, live stock and delivery you can track from checkout to doorstep.',
    `heroProductSlug` VARCHAR(191) NULL,
    `showMarquee` BOOLEAN NOT NULL DEFAULT true,
    `showCategories` BOOLEAN NOT NULL DEFAULT true,
    `showFeatures` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
