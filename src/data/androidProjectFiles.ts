/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Android Native Kotlin & Jetpack Compose Source Code Repository
 * Contains production-grade native Android code matching the BlueWave Recharge architecture.
 */

export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown';
  category: 'Domain Engine' | 'UI (Jetpack Compose)' | 'Data & Repository' | 'Gradle & Config' | 'Documentation';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/bluewave/recharge/domain/CarryForwardEngine.kt',
    name: 'CarryForwardEngine.kt',
    language: 'kotlin',
    category: 'Domain Engine',
    description: 'Authoritative Smart Data Wallet allocation and rollover engine using integer byte math',
    content: `package com.bluewave.recharge.domain

import java.time.Instant
import java.util.UUID

/**
 * High-integrity Smart Data Wallet allocation and rollover engine.
 * Tracks all allowances and consumption in 64-bit Long bytes to prevent IEEE 754 floating point drift.
 */
data class CarryForwardBucket(
    val id: String = UUID.randomUUID().toString(),
    val sourceDate: String,
    val initialBytes: Long,
    var remainingBytes: Long,
    val expiryEpochMs: Long,
    val isExpired: Boolean = false
)

enum class AllocationOrder {
    DAILY_FIRST,
    CARRY_FORWARD_FIRST
}

data class SmartDataWalletState(
    val dailyQuotaBytes: Long,
    val dailyUsedBytes: Long,
    val carryForwardBalanceBytes: Long,
    val buckets: List<CarryForwardBucket> = emptyList(),
    val isCarryForwardEnabled: Boolean = true,
    val allocationOrder: AllocationOrder = AllocationOrder.DAILY_FIRST,
    val maxCarryForwardCapacityBytes: Long = 10L * 1024 * 1024 * 1024, // 10 GB
    val expiryDays: Int = 7,
    val currentDayIndex: Int = 1
) {
    val dailyRemainingBytes: Long
        get() = (dailyQuotaBytes - dailyUsedBytes).coerceAtLeast(0L)

    val totalEligibleDataBytes: Long
        get() = dailyRemainingBytes + carryForwardBalanceBytes
}

sealed class LedgerEventType {
    object Issuance : LedgerEventType()
    object Usage : LedgerEventType()
    object Rollover : LedgerEventType()
    object Expiry : LedgerEventType()
}

data class LedgerEntry(
    val id: String = UUID.randomUUID().toString(),
    val timestamp: Long = System.currentTimeMillis(),
    val type: LedgerEventType,
    val amountBytes: Long,
    val remainingDailyBytes: Long,
    val remainingCarryForwardBytes: Long,
    val description: String,
    val idempotencyKey: String? = null
)

class CarryForwardEngine {

    companion object {
        const val ONE_KB = 1024L
        const val ONE_MB = 1024L * 1024L
        const val ONE_GB = 1024L * 1024L * 1024L

        fun formatBytes(bytes: Long): String {
            if (bytes <= 0) return "0 MB"
            return if (bytes >= ONE_GB) {
                String.format("%.2f GB", bytes.toDouble() / ONE_GB)
            } else {
                String.format("%.1f MB", bytes.toDouble() / ONE_MB)
            }
        }
    }

    /**
     * Consumes requested bytes according to the configured AllocationOrder.
     */
    fun consumeData(
        currentState: SmartDataWalletState,
        requestedBytes: Long,
        reason: String = "App Traffic"
    ): Pair<SmartDataWalletState, LedgerEntry?> {
        val totalAvailable = currentState.totalEligibleDataBytes
        val actualBytes = requestedBytes.coerceAtMost(totalAvailable)
        if (actualBytes <= 0) return Pair(currentState, null)

        var newDailyUsed = currentState.dailyUsedBytes
        var newCarryForward = currentState.carryForwardBalanceBytes
        val updatedBuckets = currentState.buckets.toMutableList()

        if (currentState.allocationOrder == AllocationOrder.DAILY_FIRST) {
            val dailyRemaining = currentState.dailyRemainingBytes
            if (actualBytes <= dailyRemaining) {
                newDailyUsed += actualBytes
            } else {
                val fromCarry = actualBytes - dailyRemaining
                newDailyUsed = currentState.dailyQuotaBytes
                newCarryForward = (newCarryForward - fromCarry).coerceAtLeast(0L)

                // FIFO bucket deduction
                var toDeduct = fromCarry
                val iterator = updatedBuckets.listIterator()
                while (iterator.hasNext() && toDeduct > 0) {
                    val bkt = iterator.next()
                    val deduct = bkt.remainingBytes.coerceAtMost(toDeduct)
                    toDeduct -= deduct
                    val updated = bkt.copy(remainingBytes = bkt.remainingBytes - deduct)
                    if (updated.remainingBytes <= 0) {
                        iterator.remove()
                    } else {
                        iterator.set(updated)
                    }
                }
            }
        } else {
            // CARRY_FORWARD_FIRST
            if (actualBytes <= newCarryForward) {
                newCarryForward -= actualBytes
            } else {
                val fromDaily = actualBytes - newCarryForward
                newCarryForward = 0L
                updatedBuckets.clear()
                newDailyUsed = (newDailyUsed + fromDaily).coerceAtMost(currentState.dailyQuotaBytes)
            }
        }

        val nextState = currentState.copy(
            dailyUsedBytes = newDailyUsed,
            carryForwardBalanceBytes = newCarryForward,
            buckets = updatedBuckets
        )

        val ledger = LedgerEntry(
            type = LedgerEventType.Usage,
            amountBytes = actualBytes,
            remainingDailyBytes = nextState.dailyRemainingBytes,
            remainingCarryForwardBytes = nextState.carryForwardBalanceBytes,
            description = "Consumed \${formatBytes(actualBytes)} for \$reason"
        )

        return Pair(nextState, ledger)
    }

    /**
     * Executes atomic daily rollover at day boundary.
     * Sweeps eligible unused daily quota into Carry Forward balance.
     */
    fun executeDailyRollover(
        currentState: SmartDataWalletState,
        idempotencyKey: String
    ): Triple<SmartDataWalletState, List<LedgerEntry>, String?> {
        val now = System.currentTimeMillis()
        val entries = mutableListOf<LedgerEntry>()
        val unusedBytes = currentState.dailyRemainingBytes

        var currentCarry = currentState.carryForwardBalanceBytes
        val activeBuckets = currentState.buckets.filter { it.expiryEpochMs > now }.toMutableList()

        // Rollover unused data
        var amountRolledOver = 0L
        var notification: String? = null

        if (currentState.isCarryForwardEnabled && unusedBytes > 0) {
            val availableCap = (currentState.maxCarryForwardCapacityBytes - currentCarry).coerceAtLeast(0L)
            amountRolledOver = unusedBytes.coerceAtMost(availableCap)

            if (amountRolledOver > 0) {
                currentCarry += amountRolledOver
                val expiryEpoch = now + (currentState.expiryDays * 24L * 60L * 60L * 1000L)
                activeBuckets.add(
                    CarryForwardBucket(
                        sourceDate = "Day \${currentState.currentDayIndex}",
                        initialBytes = amountRolledOver,
                        remainingBytes = amountRolledOver,
                        expiryEpochMs = expiryEpoch
                    )
                )

                entries.add(
                    LedgerEntry(
                        type = LedgerEventType.Rollover,
                        amountBytes = amountRolledOver,
                        remainingDailyBytes = 0L,
                        remainingCarryForwardBytes = currentCarry,
                        description = "Rolled over \${formatBytes(amountRolledOver)} into Carry Forward",
                        idempotencyKey = idempotencyKey
                    )
                )

                notification = "You saved \${formatBytes(amountRolledOver)} today. Carry Forward balance is \${formatBytes(currentCarry)}."
            }
        }

        // Issue new day allowance
        val nextDayIndex = currentState.currentDayIndex + 1
        entries.add(
            LedgerEntry(
                type = LedgerEventType.Issuance,
                amountBytes = currentState.dailyQuotaBytes,
                remainingDailyBytes = currentState.dailyQuotaBytes,
                remainingCarryForwardBytes = currentCarry,
                description = "Issued fresh daily allowance of \${formatBytes(currentState.dailyQuotaBytes)} for Day \$nextDayIndex"
            )
        )

        val nextState = currentState.copy(
            currentDayIndex = nextDayIndex,
            dailyUsedBytes = 0L,
            carryForwardBalanceBytes = currentCarry,
            buckets = activeBuckets
        )

        return Triple(nextState, entries, notification)
    }
}
`,
  },
  {
    path: 'app/src/test/java/com/bluewave/recharge/CarryForwardEngineTest.kt',
    name: 'CarryForwardEngineTest.kt',
    language: 'kotlin',
    category: 'Domain Engine',
    description: 'Unit test suite ensuring exact byte preservation, rollover, and boundary safety',
    content: `package com.bluewave.recharge

import com.bluewave.recharge.domain.*
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class CarryForwardEngineTest {

    private lateinit var engine: CarryForwardEngine
    private val TWO_GB = 2L * CarryForwardEngine.ONE_GB

    @Before
    fun setup() {
        engine = CarryForwardEngine()
    }

    @Test
    fun testUnusedDataPreservedOnRollover() {
        // Daily: 2 GB, Used: 1.25 GB -> Unused: 750 MB
        val used1250MB = (1.25 * CarryForwardEngine.ONE_GB).toLong()
        val initial = SmartDataWalletState(
            dailyQuotaBytes = TWO_GB,
            dailyUsedBytes = used1250MB,
            carryForwardBalanceBytes = 0L
        )

        val (nextState, entries, notification) = engine.executeDailyRollover(
            currentState = initial,
            idempotencyKey = "test-day-1-rollover"
        )

        val expectedRolledOver = TWO_GB - used1250MB // 750 MB
        assertEquals("Rolled over balance must match unused quota", expectedRolledOver, nextState.carryForwardBalanceBytes)
        assertEquals("Daily allowance must reset to full 2.0 GB", TWO_GB, nextState.dailyRemainingBytes)
        assertEquals("Daily used must reset to 0", 0L, nextState.dailyUsedBytes)
        assertNotNull("Must generate user notification", notification)
        assertTrue(entries.isNotEmpty())
    }

    @Test
    fun testCapacityCapEnforced() {
        val maxCap = 5L * CarryForwardEngine.ONE_GB
        val nearCapState = SmartDataWalletState(
            dailyQuotaBytes = TWO_GB,
            dailyUsedBytes = 0L, // 2 GB unused
            carryForwardBalanceBytes = 4L * CarryForwardEngine.ONE_GB,
            maxCarryForwardCapacityBytes = maxCap
        )

        val (nextState, _, _) = engine.executeDailyRollover(
            currentState = nearCapState,
            idempotencyKey = "cap-test"
        )

        assertEquals("Carry forward balance must not exceed cap", maxCap, nextState.carryForwardBalanceBytes)
    }

    @Test
    fun testConsumptionDailyFirst() {
        val state = SmartDataWalletState(
            dailyQuotaBytes = TWO_GB,
            dailyUsedBytes = 0L,
            carryForwardBalanceBytes = 1L * CarryForwardEngine.ONE_GB,
            allocationOrder = AllocationOrder.DAILY_FIRST
        )

        val (afterUse, ledger) = engine.consumeData(state, 500L * CarryForwardEngine.ONE_MB)
        assertNotNull(ledger)
        assertEquals("Daily used must increment", 500L * CarryForwardEngine.ONE_MB, afterUse.dailyUsedBytes)
        assertEquals("Carry forward must remain untouched", 1L * CarryForwardEngine.ONE_GB, afterUse.carryForwardBalanceBytes)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/bluewave/recharge/ui/screens/HomeScreen.kt',
    name: 'HomeScreen.kt',
    language: 'kotlin',
    category: 'UI (Jetpack Compose)',
    description: 'Jetpack Compose Home screen with active plan, Smart Data Wallet, and BlueWave visual language',
    content: `package com.bluewave.recharge.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bluewave.recharge.domain.CarryForwardEngine
import com.bluewave.recharge.domain.SmartDataWalletState

// BlueWave Telecom Palette
val BlueWavePrimary = Color(0xFF0056B3)
val BlueWaveDark = Color(0xFF003366)
val BlueWaveAccent = Color(0xFF0066FF)
val BlueWaveSurface = Color(0xFFF4F7FB)

@Composable
fun HomeScreen(
    walletState: SmartDataWalletState,
    mobileNumber: String = "+91 98765 43210",
    onNavigateToRecharge: () -> Unit,
    onNavigateToMyData: () -> Unit
) {
    var isMasked by remember { mutableStateOf(true) }
    val displayMobile = if (isMasked) "+91 98••• ••210" else mobileNumber

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BlueWaveSurface)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Telecom Account Bar
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Prepaid Mobile", fontSize = 12.sp, color = Color.Gray)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(displayMobile, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { isMasked = !isMasked }) {
                            Icon(
                                if (isMasked) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle Masking",
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFE6F0FA)
                ) {
                    Text(
                        "True 5G Active",
                        color = BlueWavePrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // Active Plan Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = BlueWavePrimary),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("ACTIVE PLAN", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Text("₹349", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                    }
                    Text("24 Days Left", color = Color.White, fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Daily Quota Progress
                val dailyProgress = walletState.dailyUsedBytes.toFloat() / walletState.dailyQuotaBytes.toFloat()
                LinearProgressIndicator(
                    progress = dailyProgress,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = Color.White,
                    trackColor = Color.White.copy(alpha = 0.3f)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "\${CarryForwardEngine.formatBytes(walletState.dailyRemainingBytes)} left of 2.0 GB",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text("Renews at 11:59 PM", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                }
            }
        }

        // Smart Data Wallet / Carry Forward Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Savings, contentDescription = null, tint = BlueWaveAccent)
                        Text("Carry Forward Data", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                    TextButton(onClick = onNavigateToMyData) {
                        Text("Manage", color = BlueWavePrimary, fontWeight = FontWeight.SemiBold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    CarryForwardEngine.formatBytes(walletState.carryForwardBalanceBytes),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = BlueWaveDark
                )
                Text(
                    "Eligible unused daily data preserved for later use · Expires in 3 days",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
        }

        // Quick Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Button(
                onClick = onNavigateToRecharge,
                colors = ButtonDefaults.buttonColors(containerColor = BlueWavePrimary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text("Recharge Now")
            }
            Spacer(modifier = Modifier.width(12.dp))
            OutlinedButton(
                onClick = onNavigateToMyData,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text("View Wallet")
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/bluewave/recharge/data/OperatorApiInterface.kt',
    name: 'OperatorApiInterface.kt',
    language: 'kotlin',
    category: 'Data & Repository',
    description: 'Retrofit interface and repository abstraction for telecom operator integration and payment callbacks',
    content: `package com.bluewave.recharge.data

import retrofit2.Response
import retrofit2.http.*

data class SubscriberProfileDto(
    val msisdn: String,
    val circle: String,
    val planId: String,
    val planExpiryEpoch: Long,
    val dailyQuotaBytes: Long,
    val dailyConsumedBytes: Long,
    val carryForwardBalanceBytes: Long,
    val is5GActive: Boolean
)

data class PlanDto(
    val id: String,
    val name: String,
    val price: Double,
    val validityDays: Int,
    val dailyDataBytes: Long?,
    val is5GEligible: Boolean,
    val voice: String,
    val sms: String,
    val category: String,
    val ottBenefits: List<String>
)

data class RechargeRequest(
    val msisdn: String,
    val planId: String,
    val transactionRef: String,
    val paymentGatewayId: String,
    val idempotencyKey: String
)

data class RechargeResponse(
    val status: String,
    val orderId: String,
    val activeFromEpoch: Long,
    val message: String
)

interface OperatorApiInterface {

    @GET("/v1/telecom/subscribers/{msisdn}")
    suspend fun getSubscriberProfile(
        @Path("msisdn") msisdn: String,
        @Header("Authorization") bearerToken: String
    ): Response<SubscriberProfileDto>

    @GET("/v1/telecom/plans")
    suspend fun getActivePlans(): Response<List<PlanDto>>

    @POST("/v1/telecom/recharge/execute")
    suspend fun executeRecharge(
        @Body request: RechargeRequest,
        @Header("Authorization") bearerToken: String
    ): Response<RechargeResponse>

    @POST("/v1/telecom/rollover/audit")
    suspend fun syncRolloverLedger(
        @Path("msisdn") msisdn: String,
        @Body ledgerPayload: Map<String, Any>
    ): Response<Map<String, String>>
}
`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'kotlin',
    category: 'Gradle & Config',
    description: 'Android module Gradle build configuration with Jetpack Compose, Material 3, and Coroutines',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.bluewave.recharge"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bluewave.recharge"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.kotlinx.coroutines.android)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'Gradle & Config',
    description: 'Android application manifest with network permissions and MainActivity declarations',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="BlueWave Recharge"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BlueWaveRecharge">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.BlueWaveRecharge">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`,
  },
  {
    path: 'README.md',
    name: 'AndroidStudio_Setup.md',
    language: 'markdown',
    category: 'Documentation',
    description: 'Instructions for building, running on emulator, and production telecom gateway integration',
    content: `# BlueWave Recharge - Android Native Application

## Architecture Overview
- **UI Layer**: 100% Jetpack Compose with Material 3, dynamic theme, and Indian telecom visual language.
- **Domain Layer**: Clean \`CarryForwardEngine\` enforcing integer 64-bit Long byte allocations, rollover sweep, capacity limits, and append-only ledger events.
- **Data Layer**: Repository pattern with \`OperatorApiInterface\` (Retrofit) and Demo Sandbox fallbacks.

## Opening in Android Studio
1. Open Android Studio (Hedgehog, Iguana, Koala or newer).
2. Select **Open Project** and choose the root directory containing \`build.gradle.kts\`.
3. Allow Gradle to synchronize dependencies.
4. Select an Android 14 / 15 (API 34/35) AVD emulator or physical device.
5. Click **Run** (\`Shift + F10\`).

## Running Unit Tests
Execute:
\`\`\`bash
./gradlew test
\`\`\`
This runs \`CarryForwardEngineTest.kt\`, verifying daily rollover preservation, capacity caps, and allocation orders.
`,
  },
];
