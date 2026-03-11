# 💅 Dexi's Nails

## Cómo subir a Netlify (paso a paso)

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Dexi's Nails v1"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dexis-nails.git
git push -u origin main
```

### 2. Conectar con Netlify
1. Entrá a netlify.com
2. Click en "Add new site" → "Import an existing project"
3. Elegí GitHub y seleccioná el repo `dexis-nails`
4. Build settings: dejá todo vacío (no necesita build)
5. Click "Deploy site"

### 3. Configurar variables de entorno en Netlify
Ir a: Site settings → Environment variables → Add variable

| Variable | Valor |
|----------|-------|
| `ANTHROPIC_API_KEY` | tu key sk-ant-... |
| `WHATSAPP_NUMERO` | 573206196500 (sin + ni espacios) |
| `CALLMEBOT_APIKEY` | (ver paso 4) |

### 4. Configurar CallMeBot (WhatsApp gratuito)
1. Desde el WhatsApp de Dexi, enviar este mensaje al número **+34 644 59 77 30**:
   ```
   I allow callmebot to send me messages
   ```
2. Vas a recibir un mensaje con tu apikey (ej: `1234567`)
3. Esa apikey la ponés en la variable `CALLMEBOT_APIKEY` en Netlify

### 5. Cambiar número de WhatsApp
Cuando quieras cambiar del número de prueba al de Dexi:
- Ir a Netlify → Environment variables
- Cambiar `WHATSAPP_NUMERO` por `573151445041`
- Click "Save" — listo, sin tocar código

## Estructura del proyecto
```
dexis-nails/
├── index.html              # App principal
├── styles.css              # Estilos
├── app.js                  # Lógica del salón
├── game.js                 # Juego Arcadia
├── chat.js                 # Chat frontend
├── netlify.toml            # Configuración Netlify
└── netlify/
    └── functions/
        └── chat.js         # Proxy API (serverless)
```
