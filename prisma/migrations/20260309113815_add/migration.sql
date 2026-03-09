-- CreateTable
CREATE TABLE "UserHeartRate" (
    "userHeartRateRecordId" SERIAL NOT NULL,
    "dailyRecordId" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "reading" INTEGER NOT NULL,

    CONSTRAINT "UserHeartRate_pkey" PRIMARY KEY ("userHeartRateRecordId")
);

-- AddForeignKey
ALTER TABLE "UserHeartRate" ADD CONSTRAINT "UserHeartRate_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("dailyRecordId") ON DELETE RESTRICT ON UPDATE CASCADE;
