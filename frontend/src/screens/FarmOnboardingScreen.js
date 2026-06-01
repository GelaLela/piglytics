/**
 * frontend/src/screens/FarmOnboardingScreen.js
 *
 * Shown on first login when Farm.baseline_established = false.
 * Allows an existing farm to enter historical data so analytics
 * are accurate from day one.
 *
 * Two paths triggered from RegisterScreen:
 *   "new" → skip this screen, go straight to Dashboard
 *   "existing" → show this screen before Dashboard
 *
 * Submits to POST /api/farms/{id}/baseline/
 * Sets Farm.baseline_established = true on the backend.
 *
 * All emojis replaced with PNG icons.
 */
import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { COLORS, RADIUS, SHADOW } from "../theme";
import Icon from "../components/Icon";

const COMMON_DISEASES = [
  "PRRS", "Swine Flu", "FMD", "Swine Dysentery",
  "Hog Cholera", "ASF", "PED Virus", "Mange",
];

export default function FarmOnboardingScreen({ navigation }) {
  const { farmId } = useAuth();
  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    years_in_operation:          "",
    pigs_at_registration:        "",
    avg_breeding_sows:           "",
    litters_last_12_months:      "",
    avg_litter_size_historical:  "",
    avg_daily_feed_kg_per_pig:   "",
    notes:                       "",
    selected_diseases:           [],
  });

  function setF(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  function toggleDisease(disease) {
    setForm(prev => ({
      ...prev,
      selected_diseases: prev.selected_diseases.includes(disease)
        ? prev.selected_diseases.filter(d => d !== disease)
        : [...prev.selected_diseases, disease],
    }));
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const payload = {
        years_in_operation:          form.years_in_operation ? parseInt(form.years_in_operation) : 0,
        pigs_at_registration:        form.pigs_at_registration ? parseInt(form.pigs_at_registration) : 0,
        avg_breeding_sows:           form.avg_breeding_sows ? parseInt(form.avg_breeding_sows) : 0,
        litters_last_12_months:      form.litters_last_12_months ? parseInt(form.litters_last_12_months) : 0,
        avg_litter_size_historical:  form.avg_litter_size_historical ? parseFloat(form.avg_litter_size_historical) : 0,
        avg_daily_feed_kg_per_pig:   form.avg_daily_feed_kg_per_pig ? parseFloat(form.avg_daily_feed_kg_per_pig) : 0,
        common_diseases:             form.selected_diseases.join(", "),
        notes:                       form.notes,
      };
      await api.saveFarmBaseline(farmId, payload);
      Alert.alert(
        "All Set!",
        "Your farm's historical data has been saved. Analytics will now incorporate this history for more accurate insights.",
        [{ text: "Start Using Piglytics", onPress: () => navigation.replace("Dashboard") }]
      );
    } catch (e) {
      Alert.alert("Error", e.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function skipOnboarding() {
    Alert.alert(
      "Skip Setup?",
      "You can always complete this later. Analytics will start from the data you enter going forward.",
      [
        { text: "Complete Now", style: "cancel" },
        { text: "Skip", onPress: () => navigation.replace("Dashboard") },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={s.header}>
        <Icon name="analytics" size={36} tintColor={COLORS.white} style={{ marginBottom: 8 }} />
        <Text style={s.headerTitle}>Set Up Your Farm Profile</Text>
        <Text style={s.headerSub}>
          Since your farm was already operating before joining Piglytics, let's capture some
          historical data so your analytics are meaningful from day one.
        </Text>
        <View style={s.progressDots}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[s.dot, step >= i && s.dotActive]} />
          ))}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: Farm basics ───────────────────────────────────────── */}
        {step === 1 && (
          <>
            <StepTitle step={1} title="Farm History" />

            <Card>
              <Field label="How many years has this farm been operating?">
                <TextInput style={s.input} value={form.years_in_operation}
                  onChangeText={v => setF("years_in_operation", v)}
                  placeholder="e.g. 4" placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad" />
              </Field>
              <Field label="Total pigs currently on the farm">
                <TextInput style={s.input} value={form.pigs_at_registration}
                  onChangeText={v => setF("pigs_at_registration", v)}
                  placeholder="e.g. 80" placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad" />
              </Field>
              <Field label="Average number of breeding sows maintained">
                <TextInput style={s.input} value={form.avg_breeding_sows}
                  onChangeText={v => setF("avg_breeding_sows", v)}
                  placeholder="e.g. 12" placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad" />
              </Field>
            </Card>

            <View style={s.navRow}>
              <TouchableOpacity style={s.skipBtn} onPress={skipOnboarding}>
                <Text style={s.skipBtnText}>Skip setup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.nextBtn} onPress={() => setStep(2)}>
                <Text style={s.nextBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 2: Breeding & Feed history ──────────────────────────── */}
        {step === 2 && (
          <>
            <StepTitle step={2} title="Breeding & Feed History" />

            <Card title="Breeding Performance" icon="breeding" iconColor={COLORS.pink}>
              <Field label="Litters produced in the last 12 months">
                <TextInput style={s.input} value={form.litters_last_12_months}
                  onChangeText={v => setF("litters_last_12_months", v)}
                  placeholder="e.g. 24" placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad" />
              </Field>
              <Field label="Average litter size (piglets born alive)">
                <TextInput style={s.input} value={form.avg_litter_size_historical}
                  onChangeText={v => setF("avg_litter_size_historical", v)}
                  placeholder="e.g. 9.5" placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad" />
              </Field>
            </Card>

            <Card title="Feed Consumption" icon="feeds" iconColor={COLORS.amber}>
              <Field label="Average daily feed per pig (kg)">
                <TextInput style={s.input} value={form.avg_daily_feed_kg_per_pig}
                  onChangeText={v => setF("avg_daily_feed_kg_per_pig", v)}
                  placeholder="e.g. 2.5" placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad" />
              </Field>
              <Text style={s.fieldHint}>
                This calibrates the feed shortage forecast until you have 7+ days of usage logs.
              </Text>
            </Card>

            <View style={s.navRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => setStep(1)}>
                <Text style={s.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.nextBtn} onPress={() => setStep(3)}>
                <Text style={s.nextBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 3: Health history ────────────────────────────────────── */}
        {step === 3 && (
          <>
            <StepTitle step={3} title="Health History" />

            <Card title="Common Diseases" icon="health" iconColor={COLORS.danger}>
              <Text style={s.fieldLabel}>Select diseases that have historically affected your farm:</Text>
              <View style={s.diseaseGrid}>
                {COMMON_DISEASES.map(d => {
                  const selected = form.selected_diseases.includes(d);
                  return (
                    <TouchableOpacity key={d}
                      style={[s.diseaseChip, selected && s.diseaseChipActive]}
                      onPress={() => toggleDisease(d)} activeOpacity={0.8}>
                      <Text style={[s.diseaseChipText, selected && s.diseaseChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            <Card>
              <Field label="Additional notes (optional)">
                <TextInput style={[s.input, s.textArea]} value={form.notes}
                  onChangeText={v => setF("notes", v)}
                  placeholder="Any other relevant farm history..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline numberOfLines={4} textAlignVertical="top" />
              </Field>
            </Card>

            <View style={s.navRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => setStep(2)}>
                <Text style={s.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSubmit} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={s.saveBtnText}>Save Farm Profile</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepTitle({ step, title }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: "600", textTransform: "uppercase" }}>
        Step {step} of 3
      </Text>
      <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.textPrimary, marginTop: 2 }}>{title}</Text>
    </View>
  );
}

function Card({ title, icon, iconColor, children }) {
  return (
    <View style={s.card}>
      {title && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {icon && <Icon name={icon} size={16} tintColor={iconColor} />}
          <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.textPrimary }}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.screenBg },
  header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingHorizontal: 20, paddingBottom: 28 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.white },
  headerSub:   { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 8, lineHeight: 18 },
  progressDots:{ flexDirection: "row", gap: 8, marginTop: 16 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive:    { backgroundColor: COLORS.white, width: 24 },

  scroll: { flex: 1 },

  card:       { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 18, marginBottom: 14, ...SHADOW.sm },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600", marginBottom: 6 },
  fieldHint:  { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: "italic" },
  input:      { backgroundColor: COLORS.screenBg, borderRadius: RADIUS.md, padding: 13, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  textArea:   { minHeight: 90, textAlignVertical: "top" },

  diseaseGrid:          { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  diseaseChip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.screenBg },
  diseaseChipActive:    { backgroundColor: COLORS.dangerBg, borderColor: COLORS.danger },
  diseaseChipText:      { fontSize: 13, color: COLORS.textSecondary },
  diseaseChipTextActive:{ color: COLORS.danger, fontWeight: "700" },

  navRow:     { flexDirection: "row", gap: 10, marginTop: 4 },
  backBtn:    { flex: 1, backgroundColor: COLORS.screenBg, borderRadius: RADIUS.xl, padding: 14, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  backBtnText:{ fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  nextBtn:    { flex: 2, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: 14, alignItems: "center", ...SHADOW.sm },
  nextBtnText:{ color: COLORS.white, fontSize: 14, fontWeight: "700" },
  skipBtn:    { paddingHorizontal: 14, paddingVertical: 14, alignItems: "center" },
  skipBtnText:{ fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  saveBtn:    { flex: 2, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: 14, alignItems: "center", ...SHADOW.md },
  saveBtnText:{ color: COLORS.white, fontSize: 14, fontWeight: "700" },
});