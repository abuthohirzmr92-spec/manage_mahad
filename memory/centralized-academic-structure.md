---
name: centralized-academic-structure
description: Master Struktur Akademik is now the single source of truth for academic hierarchy — Instansi-based tabs with data-driven lookups
metadata:
  type: project
---

Centralized Academic Structure System is implemented. All academic hierarchy now flows from masterJenjang + masterTingkat data as single source of truth.

**Why:** User directive — "seluruh ecosystem HARUS sinkron ke Master Struktur Akademik. JANGAN hardcode tingkat. JANGAN hardcode jenjang."

**What was built:**
- `src/lib/academic-structure.ts` — Data-driven lookup functions: `getJenjangByInstansi()`, `jenjangToInstansi()`, `getAllJenjangNames()`, `getTingkatByJenjang()`, `buildInstansiJenjangMap()`
- `src/app/dashboard/struktur-akademik/page.tsx` — Management page with "Master Jenjang" and "Master Tingkat" tabs, full CRUD via modals
- `src/components/struktur-akademik/MasterJenjangTab.tsx` — Table with search, instansi filter, status filter, CRUD modals
- `src/components/struktur-akademik/MasterTingkatTab.tsx` — Table with search, jenjang filter, status filter, CRUD modals
- `src/lib/progression-label.ts` — Updated with `getTingkatLabelResolved()` and `buildTingkatLabelMap()` for data-driven label resolution
- Navigation: "Struktur Akademik" entry with GraduationCap icon

**Replaced hardcoded configs:**
- Kelas page + all 5 components (KelasTabs, UnassignedAlert, KelasClusterSection, AddKelasModal, KelasModal, AssignSantriModal) migrated from AcademicTab to Instansi with jenjangOptions props
- Mapel page + MapelTabs + MapelModal migrated to Instansi with jenjangOptions props
- Distribusi Guru page migrated from TAB_JENJANG to `getJenjangByInstansi()`
- FirestoreKelas.academicTab type changed to Instansi

**Status:** 19/19 routes build, 49/49 tests pass, TypeScript clean.
