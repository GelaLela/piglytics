/**
 * frontend/src/screens/RegisterScreen.js
 * All emojis replaced with PNG icons. Full inline validation with red asterisks.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { COLORS, RADIUS, SHADOW } from "../theme";

const ICONS = {
  pig:   require("../assets/icons/pig.png"),
  user:  require("../assets/icons/user.png"),
  lock:  require("../assets/icons/lock.png"),  
  phone: require("../assets/icons/phone.png"),     
  farm:  require("../assets/icons/home.png"),
};

// Reusable red asterisk label
function RL({ text }) {
  return (
    <Text style={s.label}>
      {text}<Text style={s.asterisk}> *</Text>
    </Text>
  );
}

// Validated input row with optional error text
const InputRow = React.forwardRef(function InputRow(
  { iconSource, error, style, ...props },
  ref
) {
  return (
    <View style={{ marginBottom: error ? 4 : 0 }}>
      <View style={[s.inputRow, error ? s.inputRowError : null, style]}>
        <Image source={iconSource} style={s.inputIcon} />
        <TextInput
          ref={ref}
          style={s.input}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
      </View>
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );
});

export default function RegisterScreen({ onBack }) {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "", username: "", password: "", confirmPass: "",
    phone_number: "", farm_name: "",
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const usernameRef = useRef();
  const passwordRef = useRef();
  const confirmRef  = useRef();
  const phoneRef    = useRef();
  const farmRef     = useRef();

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }

  function validateStep1() {
    const e = {};
    if (!form.full_name.trim())            e.full_name    = "Full name is required.";
    if (!form.username.trim())             e.username     = "Username is required.";
    else if (form.username.includes(" "))  e.username     = "Username cannot contain spaces.";
    if (!form.password)                    e.password     = "Password is required.";
    else if (form.password.length < 6)    e.password     = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPass) e.confirmPass = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    if (!form.phone_number.trim()) e.phone_number = "Phone number is required.";
    if (!form.farm_name.trim())    e.farm_name    = "Farm name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const data = await api.register({
        full_name:    form.full_name.trim(),
        username:     form.username.trim().toLowerCase(),
        password:     form.password,
        phone_number: form.phone_number.trim(),
        farm_name:    form.farm_name.trim(),
      });
      if (data?.token) {
        await login({
          token:    data.token,
          farm_id:  data.farm_id,
          is_admin: data.is_admin,
          username: data.username,
        });
      }
    } catch (e) {
      Alert.alert("Registration Failed", e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <Text style={s.backBtnText}>Back to Login</Text>
          </TouchableOpacity>
          <Image source={ICONS.pig} style={{ width: 52, height: 52, resizeMode: "contain", marginBottom: 10 }} />
          <Text style={s.headerTitle}>Create Account</Text>
          <Text style={s.headerSub}>Join Piglytics and start managing your farm</Text>
          <View style={s.stepRow}>
            <View style={[s.stepDot, step >= 1 && s.stepDotActive]} />
            <View style={[s.stepLine, step >= 2 && s.stepLineActive]} />
            <View style={[s.stepDot, step >= 2 && s.stepDotActive]} />
          </View>
          <Text style={s.stepLabel}>
            Step {step} of 2 — {step === 1 ? "Account Info" : "Farm Setup"}
          </Text>
        </View>

        <View style={s.card}>

          {/* ── STEP 1 ─────────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <RL text="Full name" />
              <InputRow
                iconSource={ICONS.user}
                error={errors.full_name}
                value={form.full_name}
                onChangeText={v => set("full_name", v)}
                placeholder="e.g. Juan Dela Cruz"
                returnKeyType="next"
                onSubmitEditing={() => usernameRef.current?.focus()}
                blurOnSubmit={false}
                style={{ marginBottom: errors.full_name ? 0 : 16 }}
              />
              {!errors.full_name && <View style={{ marginBottom: 16 }} />}

              <RL text="Username" />
              <InputRow
                ref={usernameRef}
                iconSource={ICONS.user}
                error={errors.username}
                value={form.username}
                onChangeText={v => set("username", v.toLowerCase().replace(/\s/g, ""))}
                placeholder="e.g. juanfarm (no spaces)"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                style={{ marginBottom: errors.username ? 0 : 16 }}
              />
              {!errors.username && <View style={{ marginBottom: 16 }} />}

              <RL text="Password (min. 6 characters)" />
              <View style={{ flexDirection: "row", gap: 8, marginBottom: errors.password ? 0 : 16 }}>
                <View style={[s.inputRow, errors.password ? s.inputRowError : null, { flex: 1 }]}>
                  <Image source={ICONS.lock} style={s.inputIcon} />
                  <TextInput
                    ref={passwordRef}
                    style={s.input}
                    value={form.password}
                    onChangeText={v => set("password", v)}
                    placeholder="Create password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPass}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                <TouchableOpacity style={s.showBtn} onPress={() => setShowPass(!showPass)}>
                  <Text style={s.showBtnText}>{showPass ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={s.errorText}>{errors.password}</Text> : null}

              <RL text="Confirm password" />
              <InputRow
                ref={confirmRef}
                iconSource={ICONS.lock}
                error={errors.confirmPass}
                value={form.confirmPass}
                onChangeText={v => set("confirmPass", v)}
                placeholder="Re-enter password"
                secureTextEntry={!showPass}
                returnKeyType="done"
                style={{ marginBottom: errors.confirmPass ? 0 : 8 }}
              />

              <TouchableOpacity
                style={s.nextBtn}
                onPress={() => { if (validateStep1()) setStep(2); }}
              >
                <Text style={s.nextBtnText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <View style={s.farmerBadge}>
                <Image source={ICONS.user} style={{ width: 32, height: 32, resizeMode: "contain" }} />
                <View>
                  <Text style={s.farmerBadgeTitle}>Farmer Account</Text>
                  <Text style={s.farmerBadgeSub}>Your account will be registered as a farmer</Text>
                </View>
              </View>

              <RL text="Phone number" />
              <InputRow
                ref={phoneRef}
                iconSource={ICONS.phone}
                error={errors.phone_number}
                value={form.phone_number}
                onChangeText={v => set("phone_number", v)}
                placeholder="e.g. 09171234567"
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => farmRef.current?.focus()}
                blurOnSubmit={false}
                style={{ marginBottom: errors.phone_number ? 0 : 16 }}
              />
              {!errors.phone_number && <View style={{ marginBottom: 16 }} />}

              <RL text="Farm name" />
              <InputRow
                ref={farmRef}
                iconSource={ICONS.farm}
                error={errors.farm_name}
                value={form.farm_name}
                onChangeText={v => set("farm_name", v)}
                placeholder="e.g. Dela Cruz Piggery"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                style={{ marginBottom: errors.farm_name ? 0 : 8 }}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity style={s.backStepBtn} onPress={() => setStep(1)}>
                  <Text style={s.backStepText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.registerBtn, loading && { opacity: 0.7 }]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={s.registerBtnText}>Create Account</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, paddingBottom: 48 },

  header:        { alignItems: "center", paddingTop: 40, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn:       { alignSelf: "flex-start", marginBottom: 16, paddingHorizontal: 4, paddingVertical: 6 },
  backBtnText:   { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  headerTitle:   { fontSize: 26, fontWeight: "800", color: COLORS.white },
  headerSub:     { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4, textAlign: "center" },
  stepRow:       { flexDirection: "row", alignItems: "center", marginTop: 18 },
  stepDot:       { width: 12, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.3)" },
  stepDotActive: { backgroundColor: COLORS.white },
  stepLine:      { width: 40, height: 2, backgroundColor: "rgba(255,255,255,0.3)", marginHorizontal: 6 },
  stepLineActive:{ backgroundColor: COLORS.white },
  stepLabel:     { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 6 },

  card:  { marginHorizontal: 16, backgroundColor: COLORS.white, borderRadius: RADIUS.xxl, padding: 24, ...SHADOW.lg },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8 },
  asterisk:  { color: "#E53935", fontWeight: "800" },
  errorText: { fontSize: 11, color: "#E53935", marginTop: 4, marginBottom: 10, fontWeight: "500" },

  farmerBadge:      { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.primary },
  farmerBadgeTitle: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  farmerBadgeSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  inputRow:      { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.screenBg, borderRadius: RADIUS.lg, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  inputRowError: { borderColor: "#E53935", borderWidth: 1.5 },
  inputIcon:     { width: 18, height: 18, resizeMode: "contain", opacity: 0.5 },
  input:         { flex: 1, fontSize: 14, color: COLORS.textPrimary, paddingVertical: 13 },
  showBtn:       { backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 13, borderRadius: RADIUS.lg },
  showBtnText:   { fontSize: 12, color: COLORS.primary, fontWeight: "600" },

  nextBtn:      { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: 15, alignItems: "center", marginTop: 8 },
  nextBtnText:  { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  backStepBtn:  { flex: 1, backgroundColor: COLORS.screenBg, borderRadius: RADIUS.xl, padding: 15, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  backStepText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 14 },
  registerBtn:  { flex: 2, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: 15, alignItems: "center" },
  registerBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});