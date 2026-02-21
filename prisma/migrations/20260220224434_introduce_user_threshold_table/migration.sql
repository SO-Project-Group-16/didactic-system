-- CreateTable
CREATE TABLE "UserThreshold" (
    "userThresholdId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pAlertHrMin" INTEGER NOT NULL DEFAULT 0,
    "pAlertHrMax" INTEGER NOT NULL DEFAULT 0,
    "cAlertHrMin" INTEGER NOT NULL DEFAULT 0,
    "cAlertHrMax" INTEGER NOT NULL DEFAULT 0,
    "pAlertStepsMin" INTEGER NOT NULL DEFAULT 0,
    "pAlertStepsMax" INTEGER NOT NULL DEFAULT 0,
    "cAlertStepsMin" INTEGER NOT NULL DEFAULT 0,
    "cAlertStepsMax" INTEGER NOT NULL DEFAULT 0,
    "pAlertBpMin" INTEGER NOT NULL DEFAULT 0,
    "pAlertBpMax" INTEGER NOT NULL DEFAULT 0,
    "cAlertBpMin" INTEGER NOT NULL DEFAULT 0,
    "cAlertBpMax" INTEGER NOT NULL DEFAULT 0,
    "pAlertCaloriesMin" INTEGER NOT NULL DEFAULT 0,
    "pAlertCaloriesMax" INTEGER NOT NULL DEFAULT 0,
    "cAlertCaloriesMin" INTEGER NOT NULL DEFAULT 0,
    "cAlertCaloriesMax" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserThreshold_pkey" PRIMARY KEY ("userThresholdId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserThreshold_userId_key" ON "UserThreshold"("userId");

-- AddForeignKey
ALTER TABLE "UserThreshold" ADD CONSTRAINT "UserThreshold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
