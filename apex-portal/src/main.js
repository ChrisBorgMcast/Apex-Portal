import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { vuetify } from "./plugins/vuetify";
import "./style.css";
import { useAuthStore } from "./stores/authStore";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

const authStore = useAuthStore();
authStore.init();

app.mount("#app");
