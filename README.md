# PronosticosFC

Aplicación web estática de pronósticos deportivos para **Liga MX, Premier League, La Liga y Champions League**.

Muestra predicciones de **Over 2.5 goles**, **Ambos Anotan (BTTS)** y **Resultado Final (1/X/2)** para los próximos 10 partidos de cada liga.

---

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox)
- Clave de API en [RapidAPI → API-Football](https://rapidapi.com/api-sports/api/api-football) (plan gratuito: 100 requests/día)
- Servidor HTTP local para servir los módulos ES6 (ver abajo)

---

## Configuración

1. Abre `js/config.js` y reemplaza el valor de `API_KEY`:

```js
API_KEY: "TU_API_KEY_AQUI",
```

2. Opcionalmente ajusta `SEASON` si la temporada activa no coincide con el año actual.

---

## Ejecución local

### Con Python (recomendado)

```powershell
cd C:\Users\USER\Desktop\verdent-project
python -m http.server 8080
```

Luego abre `http://localhost:8080` en el navegador.

### Con Node.js (`npx serve`)

```powershell
npx serve .
```

> **Nota:** No abras `index.html` con doble clic directamente. Los módulos ES6 (`type="module"`) requieren que los archivos se sirvan por HTTP.

---

## Estructura del proyecto

```
verdent-project/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos (tema oscuro, responsivo)
└── js/
    ├── config.js       # API key y IDs de ligas
    ├── api.js          # Llamadas a API-Football con cache
    ├── predictions.js  # Lógica de pronósticos
    └── app.js          # Renderizado y control de UI
```

---

## Ligas soportadas

| Liga             | ID API-Football |
|------------------|-----------------|
| Liga MX          | 262             |
| Premier League   | 39              |
| La Liga          | 140             |
| Champions League | 2               |

---

## Notas

- Los datos se guardan en `sessionStorage` para minimizar el uso de la cuota de la API.
- El plan gratuito de API-Football permite **100 requests/día**.
- La API key queda expuesta en el cliente; esta app está pensada para uso **personal/local**.
