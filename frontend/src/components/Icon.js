/**
 * frontend/src/components/Icon.js
 *
 * PNG icons are ALREADY COLORED assets — do NOT apply tintColor.
 * Active/inactive states use opacity only, never color transforms.
 *
 * Usage:
 *   <Icon name="pig" size={24} />                    — full opacity
 *   <Icon name="pig" size={24} inactive />            — 40% opacity (tab inactive)
 *   <Icon name="pig" size={24} style={{ opacity: 0.5 }} />  — custom opacity
 *
 * Missing PNG placeholders are noted with TODO comments.
 */
import React from "react";
import { Image } from "react-native";

const ICON_MAP = {
  // Direct matches — use your actual PNG files
  admin:     require("../assets/icons/admin.png"),
  analytics: require("../assets/icons/analytics.png"),
  audit:     require("../assets/icons/audit.png"),
  bell:      require("../assets/icons/bell.png"),
  breeding:  require("../assets/icons/breeding.png"),
  feeds:     require("../assets/icons/feeds.png"),
  forecast:  require("../assets/icons/forecast.png"),
  farrowed:  require("../assets/icons/forrowed.png"),
  home:      require("../assets/icons/home.png"),
  inventory: require("../assets/icons/inventory.png"),
  logout:    require("../assets/icons/logout.png"),
  pig:       require("../assets/icons/pig.png"),
  pill:      require("../assets/icons/pill.png"),
  pregnant:  require("../assets/icons/pregnant.png"),
  user:      require("../assets/icons/user.png"),
  vaccine:   require("../assets/icons/vaccine.png"),

  // Placeholders using closest available icon
  weight:   require("../assets/icons/analytics.png"),   // TODO: Replace with weight.png
  health:   require("../assets/icons/pill.png"),         // TODO: Replace with stethoscope.png
  disease:  require("../assets/icons/pill.png"),         // TODO: Replace with disease.png
  growth:   require("../assets/icons/analytics.png"),   // TODO: Replace with growth.png
  calendar: require("../assets/icons/forecast.png"),    // TODO: Replace with calendar.png
  trash:    require("../assets/icons/logout.png"),       // TODO: Replace with trash.png
  add:      require("../assets/icons/analytics.png"),   // TODO: Replace with add.png
  edit:     require("../assets/icons/analytics.png"),   // TODO: Replace with edit.png
  shield:   require("../assets/icons/admin.png"),        // TODO: Replace with shield.png
  farmer:   require("../assets/icons/user.png"),         // TODO: Replace with farmer.png
  notes:    require("../assets/icons/audit.png"),        // TODO: Replace with notes.png
  alert:    require("../assets/icons/bell.png"),         // TODO: Replace with alert.png
  check:    require("../assets/icons/analytics.png"),   // TODO: Replace with check.png
  weather:  require("../assets/icons/forecast.png"),    // TODO: Replace with weather.png
  medicine: require("../assets/icons/pill.png"),         // TODO: Replace with medicine.png
  star:     require("../assets/icons/analytics.png"),   // TODO: Replace with star.png
  farm:     require("../assets/icons/home.png"),         // TODO: Replace with farm.png
};

/**
 * @param {string}  name     — icon key from ICON_MAP
 * @param {number}  size     — width and height in dp (default 24)
 * @param {boolean} inactive — if true, renders at 40% opacity (for inactive tab icons)
 * @param {object}  style    — additional styles; use opacity here, never tintColor
 */
export default function Icon({ name, size = 24, inactive = false, style }) {
  const source = ICON_MAP[name] || ICON_MAP.analytics;
  return (
    <Image
      source={source}
      style={[
        { width: size, height: size, resizeMode: "contain" },
        inactive ? { opacity: 0.4 } : { opacity: 1 },
        style,
      ]}
    />
  );
}