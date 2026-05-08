import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "customerTheme",
    themes: {
      customerTheme: {
        dark: false,
        colors: {
          primary: "#6B3F24",
          secondary: "#C49A6C",
          background: "#F7EFE5",
          surface: "#FFF8F0",
          accent: "#A47551",
          error: "#B00020",
          success: "#4E7D45"
        }
      },
      customerDarkTheme: {
        dark: true,
        colors: {
          primary: "#C49A6C",
          secondary: "#A47551",
          background: "#17120E",
          surface: "#241A14",
          accent: "#D8B178",
          error: "#FF6B7A",
          success: "#8FBE7D"
        }
      },
      staffTheme: {
        dark: false,
        colors: {
          primary: "#5A0F1B",
          secondary: "#8C1D2C",
          background: "#F4F1ED",
          surface: "#FFFFFF",
          accent: "#C9A227",
          error: "#B00020",
          success: "#2E7D32"
        }
      },
      staffDarkTheme: {
        dark: true,
        colors: {
          primary: "#8C1D2C",
          secondary: "#5A0F1B",
          background: "#151113",
          surface: "#24191C",
          accent: "#C9A227",
          error: "#FF6B7A",
          success: "#7CBC7C"
        }
      }
    }
  },
  defaults: {
    VCard: {
      color: "surface"
    },
    VBtn: {
      color: "primary"
    },
    VChip: {
      color: "secondary"
    }
  }
});
