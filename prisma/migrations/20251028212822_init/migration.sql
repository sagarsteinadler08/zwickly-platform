/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GermanCultureInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MensaMenu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PushSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Timetable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhzNews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."Exam";

-- DropTable
DROP TABLE "public"."GermanCultureInteraction";

-- DropTable
DROP TABLE "public"."Item";

-- DropTable
DROP TABLE "public"."MensaMenu";

-- DropTable
DROP TABLE "public"."Profile";

-- DropTable
DROP TABLE "public"."PushSubscription";

-- DropTable
DROP TABLE "public"."Timetable";

-- DropTable
DROP TABLE "public"."WhzNews";

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "event_date" DATE,
    "event_time" TEXT,
    "image_url" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "likes" INTEGER DEFAULT 0,
    "prosts" INTEGER DEFAULT 0,
    "description" TEXT,
    "language" TEXT,
    "registration_info" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable" (
    "id" UUID NOT NULL,
    "day_name" TEXT NOT NULL,
    "day_time" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "room" TEXT,
    "instructor" TEXT,
    "cycle" TEXT,
    "sem_group" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whz_news" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whz_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" UUID NOT NULL,
    "course" TEXT NOT NULL,
    "space" TEXT,
    "lecturer" TEXT,
    "date" TEXT,
    "period" TEXT,
    "sem_group" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_culture_interactions" (
    "id" UUID NOT NULL,
    "situation" TEXT NOT NULL,
    "culture_background" TEXT,
    "german_behavior" TEXT,
    "interpretation" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "german_culture_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensa_menu" (
    "id" UUID NOT NULL,
    "meal_station" TEXT,
    "dish_description" TEXT,
    "price_s" TEXT,
    "price_m" TEXT,
    "price_g" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensa_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
