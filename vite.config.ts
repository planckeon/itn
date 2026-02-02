import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/itn/",
	build: {
		outDir: "dist",
		rollupOptions: {
			output: {
				manualChunks: {
					// Split KaTeX into its own chunk for lazy loading
					katex: ["katex"],
				},
			},
		},
	},
});
