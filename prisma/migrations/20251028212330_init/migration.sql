-- CreateTable
CREATE TABLE "Event" (
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

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
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

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhzNews" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhzNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" UUID NOT NULL,
    "course" TEXT NOT NULL,
    "space" TEXT,
    "lecturer" TEXT,
    "date" TEXT,
    "period" TEXT,
    "sem_group" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GermanCultureInteraction" (
    "id" UUID NOT NULL,
    "situation" TEXT NOT NULL,
    "culture_background" TEXT,
    "german_behavior" TEXT,
    "interpretation" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GermanCultureInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensaMenu" (
    "id" UUID NOT NULL,
    "meal_station" TEXT,
    "dish_description" TEXT,
    "price_s" TEXT,
    "price_m" TEXT,
    "price_g" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensaMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
