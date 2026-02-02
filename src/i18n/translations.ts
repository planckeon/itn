/**
 * Internationalization (i18n) system for ITN
 * Supports English and multiple languages
 */

export type Language = "en" | "es" | "fr" | "de" | "ja" | "zh" | "hi";

export interface Translations {
	// UI Labels
	preset: string;
	flavor: string;
	energy: string;
	speed: string;
	matter: string;
	help: string;
	share: string;

	// Flavors
	electron: string;
	muon: string;
	tau: string;

	// Controls
	play: string;
	pause: string;
	reset: string;

	// Physics terms
	probability: string;
	distance: string;
	time: string;
	antineutrino: string;
	neutrino: string;
	massOrdering: string;
	normalOrdering: string;
	invertedOrdering: string;
	cpPhase: string;
	matterEffect: string;

	// Panels
	flavorSpace: string;
	energySpectrum: string;
	pmnsMatrix: string;
	keyboardShortcuts: string;
	learnMore: string;
	settings: string;

	// Educational content
	whatIsNeutrino: string;
	whatIsOscillation: string;
	whyItMatters: string;

	// Tooltips (shortened)
	tooltipDeltaCP: string;
	tooltipMassOrdering: string;
	tooltipMatter: string;
	tooltipAntineutrino: string;
	tooltipTernary: string;
	tooltipSpectrum: string;
	tooltipPMNS: string;
}

const en: Translations = {
	preset: "Preset",
	flavor: "Flavor",
	energy: "Energy",
	speed: "Speed",
	matter: "Matter",
	help: "Help",
	share: "Share",

	electron: "Electron",
	muon: "Muon",
	tau: "Tau",

	play: "Play",
	pause: "Pause",
	reset: "Reset",

	probability: "Probability",
	distance: "Distance",
	time: "Time",
	antineutrino: "Antineutrino",
	neutrino: "Neutrino",
	massOrdering: "Mass Ordering",
	normalOrdering: "Normal",
	invertedOrdering: "Inverted",
	cpPhase: "CP Phase",
	matterEffect: "Matter Effect",

	flavorSpace: "Flavor Space",
	energySpectrum: "Energy Spectrum",
	pmnsMatrix: "PMNS Matrix",
	keyboardShortcuts: "Keyboard Shortcuts",
	learnMore: "Learn More",
	settings: "Settings",

	whatIsNeutrino: "What is a Neutrino?",
	whatIsOscillation: "What is Oscillation?",
	whyItMatters: "Why Does This Matter?",

	tooltipDeltaCP:
		"δCP is the CP violation phase (0-360°). If δCP ≠ 0° or 180°, neutrinos and antineutrinos oscillate differently.",
	tooltipMassOrdering:
		"Normal: m₁ < m₂ < m₃. Inverted: m₃ < m₁ < m₂. One of the biggest unknowns in neutrino physics!",
	tooltipMatter:
		"MSW Effect: oscillations change in matter due to electron neutrino interactions.",
	tooltipAntineutrino:
		"Antineutrinos oscillate differently: δCP and matter potential signs flip.",
	tooltipTernary:
		"Flavor space triangle: each corner = 100% of one flavor. The dot traces flavor changes over distance.",
	tooltipSpectrum:
		"Energy Spectrum: P vs E at current distance. Lower E = faster oscillation.",
	tooltipPMNS:
		"PMNS Matrix: how flavor states relate to mass states. |Uαi|² = probability.",
};

const es: Translations = {
	preset: "Preset",
	flavor: "Sabor",
	energy: "Energía",
	speed: "Velocidad",
	matter: "Materia",
	help: "Ayuda",
	share: "Compartir",

	electron: "Electrón",
	muon: "Muón",
	tau: "Tau",

	play: "Reproducir",
	pause: "Pausa",
	reset: "Reiniciar",

	probability: "Probabilidad",
	distance: "Distancia",
	time: "Tiempo",
	antineutrino: "Antineutrino",
	neutrino: "Neutrino",
	massOrdering: "Orden de Masa",
	normalOrdering: "Normal",
	invertedOrdering: "Invertido",
	cpPhase: "Fase CP",
	matterEffect: "Efecto Materia",

	flavorSpace: "Espacio de Sabor",
	energySpectrum: "Espectro de Energía",
	pmnsMatrix: "Matriz PMNS",
	keyboardShortcuts: "Atajos de Teclado",
	learnMore: "Más Información",
	settings: "Configuración",

	whatIsNeutrino: "¿Qué es un Neutrino?",
	whatIsOscillation: "¿Qué es la Oscilación?",
	whyItMatters: "¿Por qué Importa?",

	tooltipDeltaCP:
		"δCP es la fase de violación CP (0-360°). Si δCP ≠ 0° o 180°, neutrinos y antineutrinos oscilan diferente.",
	tooltipMassOrdering:
		"Normal: m₁ < m₂ < m₃. Invertido: m₃ < m₁ < m₂. ¡Uno de los mayores misterios!",
	tooltipMatter:
		"Efecto MSW: las oscilaciones cambian en materia por interacciones con electrones.",
	tooltipAntineutrino:
		"Los antineutrinos oscilan diferente: signos de δCP y potencial de materia se invierten.",
	tooltipTernary: "Triángulo de sabor: cada esquina = 100% de un sabor.",
	tooltipSpectrum: "Espectro de Energía: P vs E a distancia actual.",
	tooltipPMNS:
		"Matriz PMNS: cómo los estados de sabor se relacionan con los de masa.",
};

const ja: Translations = {
	preset: "プリセット",
	flavor: "フレーバー",
	energy: "エネルギー",
	speed: "速度",
	matter: "物質",
	help: "ヘルプ",
	share: "共有",

	electron: "電子",
	muon: "ミュー",
	tau: "タウ",

	play: "再生",
	pause: "一時停止",
	reset: "リセット",

	probability: "確率",
	distance: "距離",
	time: "時間",
	antineutrino: "反ニュートリノ",
	neutrino: "ニュートリノ",
	massOrdering: "質量順序",
	normalOrdering: "正常",
	invertedOrdering: "逆転",
	cpPhase: "CP位相",
	matterEffect: "物質効果",

	flavorSpace: "フレーバー空間",
	energySpectrum: "エネルギースペクトル",
	pmnsMatrix: "PMNS行列",
	keyboardShortcuts: "キーボードショートカット",
	learnMore: "詳細",
	settings: "設定",

	whatIsNeutrino: "ニュートリノとは？",
	whatIsOscillation: "振動とは？",
	whyItMatters: "なぜ重要か？",

	tooltipDeltaCP: "δCPはCP対称性の破れの位相です（0-360°）。",
	tooltipMassOrdering: "正常: m₁ < m₂ < m₃。逆転: m₃ < m₁ < m₂。",
	tooltipMatter: "MSW効果：物質中でニュートリノ振動が変化します。",
	tooltipAntineutrino: "反ニュートリノは異なる振動パターンを示します。",
	tooltipTernary: "フレーバー空間：各頂点が100%の確率を表します。",
	tooltipSpectrum: "エネルギースペクトル：現在の距離でのP対E。",
	tooltipPMNS: "PMNS行列：フレーバー状態と質量状態の関係。",
};

const zh: Translations = {
	preset: "预设",
	flavor: "味",
	energy: "能量",
	speed: "速度",
	matter: "物质",
	help: "帮助",
	share: "分享",

	electron: "电子",
	muon: "μ子",
	tau: "τ子",

	play: "播放",
	pause: "暂停",
	reset: "重置",

	probability: "概率",
	distance: "距离",
	time: "时间",
	antineutrino: "反中微子",
	neutrino: "中微子",
	massOrdering: "质量排序",
	normalOrdering: "正常",
	invertedOrdering: "倒置",
	cpPhase: "CP相位",
	matterEffect: "物质效应",

	flavorSpace: "味空间",
	energySpectrum: "能谱",
	pmnsMatrix: "PMNS矩阵",
	keyboardShortcuts: "键盘快捷键",
	learnMore: "了解更多",
	settings: "设置",

	whatIsNeutrino: "什么是中微子？",
	whatIsOscillation: "什么是振荡？",
	whyItMatters: "为什么重要？",

	tooltipDeltaCP: "δCP是CP破坏相位（0-360°）。",
	tooltipMassOrdering: "正常：m₁ < m₂ < m₃。倒置：m₃ < m₁ < m₂。",
	tooltipMatter: "MSW效应：物质中的振荡会发生变化。",
	tooltipAntineutrino: "反中微子的振荡模式不同。",
	tooltipTernary: "味空间三角形：每个角代表100%的某种味。",
	tooltipSpectrum: "能谱：当前距离下的P对E。",
	tooltipPMNS: "PMNS矩阵：味态与质量态的关系。",
};

const hi: Translations = {
	preset: "प्रीसेट",
	flavor: "फ्लेवर",
	energy: "ऊर्जा",
	speed: "गति",
	matter: "पदार्थ",
	help: "सहायता",
	share: "साझा करें",

	electron: "इलेक्ट्रॉन",
	muon: "म्यूऑन",
	tau: "टाउ",

	play: "चलाएं",
	pause: "रोकें",
	reset: "रीसेट",

	probability: "संभावना",
	distance: "दूरी",
	time: "समय",
	antineutrino: "प्रतिन्यूट्रिनो",
	neutrino: "न्यूट्रिनो",
	massOrdering: "द्रव्यमान क्रम",
	normalOrdering: "सामान्य",
	invertedOrdering: "उल्टा",
	cpPhase: "CP चरण",
	matterEffect: "पदार्थ प्रभाव",

	flavorSpace: "फ्लेवर स्पेस",
	energySpectrum: "ऊर्जा स्पेक्ट्रम",
	pmnsMatrix: "PMNS मैट्रिक्स",
	keyboardShortcuts: "कीबोर्ड शॉर्टकट",
	learnMore: "और जानें",
	settings: "सेटिंग्स",

	whatIsNeutrino: "न्यूट्रिनो क्या है?",
	whatIsOscillation: "दोलन क्या है?",
	whyItMatters: "यह क्यों मायने रखता है?",

	tooltipDeltaCP: "δCP CP उल्लंघन चरण है (0-360°)।",
	tooltipMassOrdering: "सामान्य: m₁ < m₂ < m₃। उल्टा: m₃ < m₁ < m₂।",
	tooltipMatter: "MSW प्रभाव: पदार्थ में दोलन बदलते हैं।",
	tooltipAntineutrino: "प्रतिन्यूट्रिनो अलग तरह से दोलन करते हैं।",
	tooltipTernary: "फ्लेवर स्पेस त्रिभुज: प्रत्येक कोना 100% एक फ्लेवर।",
	tooltipSpectrum: "ऊर्जा स्पेक्ट्रम: वर्तमान दूरी पर P बनाम E।",
	tooltipPMNS: "PMNS मैट्रिक्स: फ्लेवर और द्रव्यमान स्थितियों का संबंध।",
};

// French and German as stubs - can be expanded
const fr: Translations = {
	...en,
	preset: "Préréglage",
	energy: "Énergie",
	speed: "Vitesse",
	help: "Aide",
	share: "Partager",
};
const de: Translations = {
	...en,
	preset: "Voreinstellung",
	energy: "Energie",
	speed: "Geschwindigkeit",
	help: "Hilfe",
	share: "Teilen",
};

export const translations: Record<Language, Translations> = {
	en,
	es,
	fr,
	de,
	ja,
	zh,
	hi,
};

export const languageNames: Record<Language, string> = {
	en: "English",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	ja: "日本語",
	zh: "中文",
	hi: "हिन्दी",
};

export function getTranslation(lang: Language): Translations {
	return translations[lang] || translations.en;
}
