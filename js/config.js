/**
 * Конфигурация приложения
 */

const CONFIG = {
    SUPABASE_URL: 'https://fieldubtdsuqjvcjpxgc.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZWxkdWJ0ZHN1cWp2Y2pweGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjQ1NjAsImV4cCI6MjA5NzkwMDU2MH0.7uRx7XvP4I5R2cX28mStNM6iFfUz_wWo0Mos5zCopEY',
    ELECTRICITY_TARIFF: 8.0,
    CAPTCHA_LENGTH: 4,
    CAPTCHA_TIMEOUT: 60,
    CAPTCHA_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
};

// ============================================================
// ШАБЛОН ТЕХНИЧЕСКИХ ХАРАКТЕРИСТИК
// ============================================================
const SPEC_TEMPLATE = {
    "screw_diameter": 45,
    "screw_ratio": 20,
    "shot_volume": 150,
    "injection_weight": 135,
    "injection_rate": 85,
    "injection_pressure": 180,
    "screw_speed": 300,
    "clamp_force": 160,
    "open_stroke": 400,
    "tie_bars": "410x410",
    "max_mould_height": 500,
    "min_mould_height": 150,
    "ejector_stroke": 120,
    "ejector_force": 45,
    "max_pump_pressure": 16,
    "pump_motor_power": 30,
    "heating_power": 18,
    "dimensions": "5.2x1.8x2.1",
    "oil_tank": 450,
    "machine_weight": 5500
};

const SPEC_META = {
    groups: {
        'INJECTION UNIT': {
            label: '⚙️ Узел впрыска',
            icon: 'fa-solid fa-syringe'
        },
        'CLAMPING UNIT': {
            label: '🔧 Узел запирания',
            icon: 'fa-solid fa-grip'
        },
        'OTHER': {
            label: '📊 Прочие параметры',
            icon: 'fa-solid fa-sliders'
        }
    },
    labels: {
        'screw_diameter': 'Диаметр шнека',
        'screw_ratio': 'L/D отношение',
        'shot_volume': 'Объем впрыска (теор.)',
        'injection_weight': 'Вес впрыска (PS)',
        'injection_rate': 'Скорость впрыска',
        'injection_pressure': 'Давление впрыска',
        'screw_speed': 'Скорость шнека',
        'clamp_force': 'Усилие запирания',
        'open_stroke': 'Ход открытия',
        'tie_bars': 'Расстояние между колоннами',
        'max_mould_height': 'Макс. высота формы',
        'min_mould_height': 'Мин. высота формы',
        'ejector_stroke': 'Ход выталкивателя',
        'ejector_force': 'Усилие выталкивателя',
        'max_pump_pressure': 'Макс. давление насоса',
        'pump_motor_power': 'Мощность мотора насоса',
        'heating_power': 'Мощность нагрева',
        'dimensions': 'Габариты (Д×Ш×В)',
        'oil_tank': 'Объем маслобака',
        'machine_weight': 'Вес станка'
    },
    units: {
        'screw_diameter': 'мм',
        'screw_ratio': '',
        'shot_volume': 'см³',
        'injection_weight': 'г',
        'injection_rate': 'г/с',
        'injection_pressure': 'МПа',
        'screw_speed': 'об/мин',
        'clamp_force': 'т',
        'open_stroke': 'мм',
        'tie_bars': 'мм',
        'max_mould_height': 'мм',
        'min_mould_height': 'мм',
        'ejector_stroke': 'мм',
        'ejector_force': 'т',
        'max_pump_pressure': 'МПа',
        'pump_motor_power': 'кВт',
        'heating_power': 'кВт',
        'dimensions': 'м',
        'oil_tank': 'л',
        'machine_weight': 'кг'
    },
    groupKeys: {
        'INJECTION UNIT': ['screw_diameter', 'screw_ratio', 'shot_volume', 'injection_weight', 'injection_rate', 'injection_pressure', 'screw_speed'],
        'CLAMPING UNIT': ['clamp_force', 'open_stroke', 'tie_bars', 'max_mould_height', 'min_mould_height', 'ejector_stroke', 'ejector_force'],
        'OTHER': ['max_pump_pressure', 'pump_motor_power', 'heating_power', 'dimensions', 'oil_tank', 'machine_weight']
    }
};

window.CONFIG = CONFIG;
window.SPEC_TEMPLATE = SPEC_TEMPLATE;
window.SPEC_META = SPEC_META;

console.log('✅ config.js загружен');