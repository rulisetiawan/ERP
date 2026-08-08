import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from "react";

export default function App() {
  const [mode, setMode] = useState<"staff" | "customer">("staff");
  const [activeTab, setActiveTab] = useState<string>("attendance");

  return (
    <SafeAreaView style={styles.container}>
      {/* Role Mode Switcher Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.brandText}>ERP POS Mobile</Text>
          <View style={styles.modeSwitchContainer}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "staff" && styles.activeModeButton]}
              onPress={() => {
                setMode("staff");
                setActiveTab("attendance");
              }}
            >
              <Text style={[styles.modeText, mode === "staff" && styles.activeModeText]}>Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === "customer" && styles.activeModeButton]}
              onPress={() => {
                setMode("customer");
                setActiveTab("catalog");
              }}
            >
              <Text style={[styles.modeText, mode === "customer" && styles.activeModeText]}>Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Screen Content View */}
      <ScrollView style={styles.content}>
        {mode === "staff" ? (
          <StaffView activeTab={activeTab} />
        ) : (
          <CustomerView activeTab={activeTab} />
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        {mode === "staff" ? (
          <>
            <TabItem title="📷 Absensi" isActive={activeTab === "attendance"} onPress={() => setActiveTab("attendance")} />
            <TabItem title="📦 Opname" isActive={activeTab === "opname"} onPress={() => setActiveTab("opname")} />
            <TabItem title="🏢 Asset QR" isActive={activeTab === "asset"} onPress={() => setActiveTab("asset")} />
          </>
        ) : (
          <>
            <TabItem title="🏠 Katalog" isActive={activeTab === "catalog"} onPress={() => setActiveTab("catalog")} />
            <TabItem title="🤖 AI Assistant" isActive={activeTab === "ai_chat"} onPress={() => setActiveTab("ai_chat")} />
            <TabItem title="💳 Member QR" isActive={activeTab === "member"} onPress={() => setActiveTab("member")} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function StaffView({ activeTab }: { activeTab: string }) {
  if (activeTab === "attendance") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📷 Absensi GPS Geofencing & Selfie</Text>
        <Text style={styles.cardSub}>Lokasi: Outlet Jakarta Pusat (Radius 10m Verified)</Text>
        <View style={styles.cameraBox}>
          <Text style={styles.cameraPlaceholder}>[ Preview Live Kamera Selfie HP ]</Text>
        </View>
        <TouchableOpacity style={styles.actionButtonSuccess}>
          <Text style={styles.actionButtonText}>VERIFIKASI CHECK-IN SEKARANG</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeTab === "opname") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Stock Opname Barcode Scanner</Text>
        <Text style={styles.cardSub}>Sesi Sken: SOP-20260807-991A</Text>
        <TouchableOpacity style={styles.actionButtonPrimary}>
          <Text style={styles.actionButtonText}>📷 SCAN BARCODE SKU PRODUK</Text>
        </TouchableOpacity>
        <View style={styles.inputBox}>
          <Text style={styles.label}>Jumlah Stok Fisik:</Text>
          <Text style={styles.mockInput}>43 Pcs</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🏢 Audit Aset QR Code Scanner</Text>
      <Text style={styles.cardSub}>Arahkan kamera ke stiker QR Code Aset toko</Text>
      <View style={styles.cameraBox}>
        <Text style={styles.cameraPlaceholder}>[ QR Code Scanner Active ]</Text>
      </View>
    </View>
  );
}

function CustomerView({ activeTab }: { activeTab: string }) {
  if (activeTab === "catalog") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛍️ Marketplace Katalog Produk</Text>
        <Text style={styles.cardSub}>Promo Hari Ini: Diskon Member Gold 10%</Text>
        <View style={styles.productGrid}>
          <View style={styles.productCard}>
            <Text style={styles.productName}>Susu UHT 1L</Text>
            <Text style={styles.productPrice}>Rp 18.000</Text>
            <TouchableOpacity style={styles.smallAddButton}>
              <Text style={styles.smallAddButtonText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productCard}>
            <Text style={styles.productName}>Roti Tawar 500g</Text>
            <Text style={styles.productPrice}>Rp 15.000</Text>
            <TouchableOpacity style={styles.smallAddButton}>
              <Text style={styles.smallAddButtonText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (activeTab === "ai_chat") {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤖 Local AI Shopping Assistant</Text>
        <Text style={styles.cardSub}>Powered by Host Ollama (http://localhost:11434)</Text>
        <View style={styles.chatBubbleUser}>
          <Text style={styles.chatTextUser}>Rekomendasikan susu dan roti untuk sarapan.</Text>
        </View>
        <View style={styles.chatBubbleAI}>
          <Text style={styles.chatTextAI}>Halo! Saya menyarankan Susu UHT 1L (Rp 18.000) dan Roti Tawar 500g (Rp 15.000). Apakah mau dibuatkan draf keranjang belanja?</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>💳 Kartu Member Digital QR Code</Text>
      <Text style={styles.cardSub}>Member Code: MBR-2026-8812 (Tier: GOLD)</Text>
      <View style={styles.qrContainer}>
        <Text style={styles.qrPlaceholder}>[ Digital Member QR Code ]</Text>
      </View>
      <Text style={styles.pointText}>Total Poin Loyalty: 1.450 Poin</Text>
    </View>
  );
}

function TabItem({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: { padding: 16, backgroundColor: "#0f172a", borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandText: { fontSize: 16, fontWeight: "bold", color: "#f8fafc" },
  modeSwitchContainer: { flexDirection: "row", backgroundColor: "#1e293b", borderRadius: 8, padding: 2 },
  modeButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  activeModeButton: { backgroundColor: "#3b82f6" },
  modeText: { fontSize: 12, color: "#94a3b8" },
  activeModeText: { color: "#ffffff", fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: "#0f172a", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1e293b" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#f8fafc", marginBottom: 4 },
  cardSub: { fontSize: 12, color: "#94a3b8", marginBottom: 16 },
  cameraBox: { height: 180, backgroundColor: "#1e293b", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  cameraPlaceholder: { color: "#64748b", fontSize: 12, fontFamily: "monospace" },
  actionButtonSuccess: { backgroundColor: "#10b981", padding: 14, borderRadius: 8, alignItems: "center" },
  actionButtonPrimary: { backgroundColor: "#3b82f6", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  actionButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 13 },
  inputBox: { backgroundColor: "#1e293b", padding: 12, borderRadius: 8 },
  label: { color: "#94a3b8", fontSize: 12 },
  mockInput: { color: "#f8fafc", fontSize: 16, fontWeight: "bold", marginTop: 4 },
  productGrid: { flexDirection: "row", gap: 12 },
  productCard: { flex: 1, backgroundColor: "#1e293b", padding: 12, borderRadius: 8 },
  productName: { color: "#f8fafc", fontWeight: "bold", fontSize: 13 },
  productPrice: { color: "#10b981", fontSize: 12, marginTop: 4 },
  smallAddButton: { marginTop: 8, backgroundColor: "#3b82f6", padding: 6, borderRadius: 6, alignItems: "center" },
  smallAddButtonText: { color: "#ffffff", fontSize: 11, fontWeight: "bold" },
  chatBubbleUser: { alignSelf: "flex-end", backgroundColor: "#3b82f6", padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: "80%" },
  chatTextUser: { color: "#ffffff", fontSize: 12 },
  chatBubbleAI: { alignSelf: "flex-start", backgroundColor: "#1e293b", padding: 10, borderRadius: 12, maxWidth: "80%" },
  chatTextAI: { color: "#e2e8f0", fontSize: 12 },
  qrContainer: { height: 160, backgroundColor: "#ffffff", borderRadius: 8, justifyContent: "center", alignItems: "center", marginVertical: 12 },
  qrPlaceholder: { color: "#0f172a", fontWeight: "bold" },
  pointText: { textAlign: "center", color: "#10b981", fontWeight: "bold", fontSize: 14 },
  bottomNav: { flexDirection: "row", backgroundColor: "#0f172a", borderTopWidth: 1, borderTopColor: "#1e293b", paddingVertical: 12 },
  tabItem: { flex: 1, alignItems: "center" },
  tabText: { fontSize: 12, color: "#64748b" },
  activeTabText: { color: "#3b82f6", fontWeight: "bold" },
});
