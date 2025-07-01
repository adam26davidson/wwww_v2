/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStage" AS ENUM ('WAITING_ROOM', 'IN_PROGRESS', 'ALL_PLAYERS_WAITING', 'SENTENCES_CREATED');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "stage" "GameStage" NOT NULL,
    "players" JSON NOT NULL,
    "sentences" JSON NOT NULL,
    "permutations" JSON NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
