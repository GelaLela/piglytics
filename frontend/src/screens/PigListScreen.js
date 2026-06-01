import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Alert, Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../services/api";
import { COLORS, RADIUS, SHADOW, STAGE_COLORS, STATUS_COLORS } from "../theme";

const ICONS = {
  pig:       require("../assets/icons/pig.png"),
  analytics: require("../assets/icons/search.png"), 
  inventory: require("../assets/icons/filter.png"), 
  trash:    require("../assets/icons/trash.png"),     
};

const FILTERS = [
  { key: "All",      label: "All"      },
  { key: "grower",   label: "Growers"  },
  { key: "finisher", label: "Finishers"},
  { key: "breeder",  label: "Sows"     },
  { key: "piglet",   label: "Piglets"  },
];

export default function PigListScreen({ navigation }) {
  const [pigs,        setPigs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [activeFilter,setFilter]      = useState("All");

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter !== "All") params.stage = activeFilter;
      const data = await api.getPigs(params);
      setPigs(data.results || data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useFocusEffect(useCallback(() => { load(); }, [activeFilter]));

  async function deletePig(pig) {
    Alert.alert(
      "Remove pig",
      `Are you sure you want to remove ${pig.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove", style: "destructive",
          onPress: async () => {
            try {
              await api.deletePig(pig.id);
              load();
            } catch (e) { Alert.alert("Error", e.message); }
          },
        },
      ]
    );
  }

  const filtered = pigs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pig_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={s.screen}>
      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          {/* search icon — analytics.png as placeholder */}
          <Image source={ICONS.analytics} style={{ width: 16, height: 16, resizeMode: "contain", opacity: 0.5 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search pigs..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={s.filterBtn}>
          {/* filter icon — inventory.png as placeholder */}
          <Image source={ICONS.inventory} style={{ width: 20, height: 20, resizeMode: "contain", opacity: 0.6 }} />
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <View style={s.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.pill, activeFilter === f.key && s.pillActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.pillText, activeFilter === f.key && s.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Image source={ICONS.pig} style={{ width: 52, height: 52, resizeMode: "contain", opacity: 0.4, marginBottom: 8 }} />
              <Text style={s.emptyTitle}>No pigs found</Text>
              <Text style={s.emptySub}>Try a different filter or add a new pig</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PigCard
              pig={item}
              onPress={() => navigation.navigate("PigDetail", { pig: item })}
              onDelete={() => deletePig(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("AddPig")}>
        <Text style={s.fabPlus}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function PigCard({ pig, onPress, onDelete }) {
  const status      = STATUS_COLORS[pig.health_status] || STATUS_COLORS.healthy;
  const stage       = STAGE_COLORS[pig.growth_stage]   || STAGE_COLORS.grower;
  const genderColor = pig.gender === "female" ? COLORS.pink : COLORS.blue;
  const genderLabel = pig.gender === "female" ? "F" : "M";

  return (
    <TouchableOpacity style={s.pigCard} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar — pig.png at natural color */}
      <View style={s.pigAvatar}>
        <Image source={require("../assets/icons/pig.png")}
          style={{ width: 32, height: 32, resizeMode: "contain" }} />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={s.pigNameRow}>
          <Text style={s.pigName}>{pig.name}</Text>
          <View style={[s.genderDot, { backgroundColor: genderColor }]}>
            <Text style={s.genderDotText}>{genderLabel}</Text>
          </View>
        </View>
        <Text style={s.pigId}>{pig.pig_id}</Text>
        <View style={s.pigTags}>
          <View style={[s.tag, { backgroundColor: stage.bg }]}>
            <Text style={[s.tagText, { color: stage.text }]}>
              {pig.growth_stage.charAt(0).toUpperCase() + pig.growth_stage.slice(1)}
            </Text>
          </View>
          <Text style={s.pigWeight}>
            {pig.latest_weight ? `${pig.latest_weight} kg` : "No weight"}
          </Text>
        </View>
      </View>

      {/* Status + delete */}
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
          <View style={[s.statusDot, { backgroundColor: status.dot }]} />
          <Text style={[s.statusText, { color: status.text }]}>
            {pig.health_status === "under_treatment" ? "Under Obs." :
             pig.health_status.charAt(0).toUpperCase() + pig.health_status.slice(1)}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {/* trash — logout.png as placeholder */}
          <Image source={require("../assets/icons/trash.png")}
            style={{ width: 16, height: 16, resizeMode: "contain", opacity: 0.45 }} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },

  searchWrap: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 8 },
  searchBar:  { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 10, gap: 8, ...SHADOW.sm },
  searchInput:{ flex: 1, fontSize: 14, color: COLORS.textPrimary },
  filterBtn:  { width: 44, height: 44, backgroundColor: COLORS.white, borderRadius: 22, justifyContent: "center", alignItems: "center", ...SHADOW.sm },

  filtersRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 4, flexWrap: "wrap" },
  pill:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText:   { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500" },
  pillTextActive: { color: COLORS.white, fontWeight: "700" },

  pigCard:   { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 14, ...SHADOW.sm },
  pigAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
  pigNameRow:{ flexDirection: "row", alignItems: "center", gap: 6 },
  pigName:   { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  genderDot: { width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  genderDotText: { fontSize: 10, color: COLORS.white, fontWeight: "800" },
  pigId:     { fontSize: 11, color: COLORS.textMuted, marginTop: 1, fontFamily: "monospace" },
  pigTags:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  tag:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  tagText:   { fontSize: 11, fontWeight: "600" },
  pigWeight: { fontSize: 11, color: COLORS.textMuted },

  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 11, fontWeight: "600" },

  fab:    { position: "absolute", bottom: 24, alignSelf: "center", width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", ...SHADOW.lg },
  fabPlus:{ fontSize: 30, color: COLORS.white, lineHeight: 34 },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  emptySub:   { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },
});