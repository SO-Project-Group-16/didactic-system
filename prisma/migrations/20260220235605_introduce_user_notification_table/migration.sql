-- CreateTable
CREATE TABLE "UserNotification" (
    "notificationId" SERIAL NOT NULL,
    "appointmentId" INTEGER,
    "userId" INTEGER NOT NULL,
    "sent" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("notificationId")
);

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("appointmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
