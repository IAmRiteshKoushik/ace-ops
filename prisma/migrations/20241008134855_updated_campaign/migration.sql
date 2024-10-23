/*
  Warnings:

  - Added the required column `blurb` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `CampaignContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "blurb" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CampaignContent" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'Draft';
