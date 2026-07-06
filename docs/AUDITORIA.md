# Auditoría de Código

## Fase 1 — Limpieza (seguro, sin riesgo)

### 1. Fix `h-13` → `h-14`
- **Archivo:** `src/pages/Home.tsx:247`
- `h-13` no es clase válida en Tailwind v4. Cambiar a `h-14`.

### 2. Eliminar imports no usados
- **`src/pages/Home.tsx`** — `Button`, `Label` importados pero no usados
- **`src/pages/History.tsx`** — `Button`, `Transaction` importados pero no usados

### 3. Sacar `await updateTransaction()` de EditTransactionForm
- **Archivo:** `src/components/EditTransactionForm.tsx:65`
- `const updated = await updateTransaction(...)` ya no captura el resultado. Cambiar a `await updateTransaction(...)`.

### 4. Unificar `cn()` en Home
- **Archivo:** `src/pages/Home.tsx`
- Reemplazar template literals condicionales por `cn()` consistente con el resto del proyecto.

---

## Fase 2 — UX (riesgo bajo)

### 5. Skeleton de carga en Home
- Mostrar un placeholder animado mientras se carga balance y recientes.

### 6. Filtro de fechas en History
- Backend (`dateFrom`/`dateTo`) ya existe en `getTransactions()`. Solo falta UI.

### 7. Toast para errores
- Reemplazar `catch { // silent }` con notificación visible al usuario.

---

## Fase 3 — Optimización (riesgo medio)

### 8. Aggregate query para `getBalance()`
- **Archivo:** `src/services/transaction.ts`
- Actual: descarga todas las filas y suma en JS
- Propuesto: `SELECT type, SUM(amount) FROM transactions GROUP BY type`
- Usar `supabase.rpc()` con una función Postgres o raw query.

---

## Fase 4 — Analytics

### 9. Resumen ingresos/gastos en Analytics
- Agregar total ingresos, total gastos y neto al inicio de la página de estadísticas.

---

## Bugs activos

| Archivo | Línea | Problema |
|---|---|---|
| ~~`Home.tsx`~~ | ~~247~~ | ~~`h-13` no es clase Tailwind válida~~ ✅ |
| ~~`Home.tsx`~~ | ~~1-15~~ | ~~`Button`, `Label` importados sin uso~~ ✅ |
| ~~`History.tsx`~~ | ~~1-12~~ | ~~`Button`, `Transaction` importados sin uso~~ ✅ |
| ~~`EditTransactionForm.tsx`~~ | ~~65~~ | ~~Variable `updated` declarada pero no usada~~ ✅ |

---

## Resumen Final

### Implementado

| Fase | Items | Resultado |
|---|---|---|
| **Fase 1 — Limpieza** | 4/4 | `h-13` → `h-14`, imports huérfanos eliminados, `const updated` → `await`, template literals → `cn()` |
| **Fase 2 — UX** | 3/3 | Skeleton animado en Home, DatePicker inline táctil (sin botón Establecer), Toast para errores en toda la app. Filtros de categoría y fecha ocultos al seleccionar "Ingreso" en History. |

### No implementado

| Fase | Item | Motivo |
|---|---|---|
| **Fase 3 — #8** | Aggregate query en `getBalance()` | La sintaxis `.select("type, sum:amount.sum()")` de Supabase JS no funcionó en producción. Se revertió el commit (`a2ad7f3`). La suma en JS es suficiente para uso personal. |
| **Fase 4 — #9** | Resumen ingresos/gastos en Analytics | Descartado por decisión del usuario: el balance ya se muestra en Home y la vista actual de Analytics le gusta como está. |

### Resultado final

- Código más limpio (sin imports muertos, clases inválidas, variables sin usar)
- UX mejorada (skeleton evita blank flashes, DatePicker responde al toque sin pasos extra, errores visibles al usuario)
- Sin dependencias nuevas, sin migraciones de DB, sin breaking changes
- Todas las funcionalidades existentes intactas
