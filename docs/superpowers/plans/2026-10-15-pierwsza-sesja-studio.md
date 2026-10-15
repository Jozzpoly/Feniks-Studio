# Pierwsza sesja Feniks Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Read the linked spec before implementation.

**Goal:** Autor sam składa miejsce z własnych modeli, zmienia je, zachowuje wariant i wraca do swojej pracy wraz z warsztatem, bez układania sceny przez agenta.

**Architecture:** Osobny, serializowalny projekt z trwałymi identyfikatorami i przypięciami do niezmiennych rewizji zasobów. React i Three.js prezentują projekt; stan paneli należy do osobnego warsztatu. Pierwszy host działa lokalnie w przeglądarce, zapisuje pracę transakcyjnie w IndexedDB i przenosi ją w samowystarczalnym pliku.

**Tech Stack:** TypeScript, React, Three.js, Dockview Community, IndexedDB przez `idb`, archiwum ZIP przez `fflate`; Vite, Vitest i Playwright. Node 24.19.0 jest dostępny w środowisku przygotowania planu.

**Spec:** [Pierwsza sesja Studio](../specs/2026-10-14-pierwsza-sesja-studio-design.md), rekomendowany wariant A.

**Status — 15 października 2026:** plan do przeglądu przed implementacją. Powstał po poleceniu kontynuacji od propozycji sesji. Wybory techniczne poniżej są rekomendacją Astry, nie deklaracją sprawdzonej aplikacji ani zatwierdzeniem przez Ownera każdego szczegółu. Nie instalowano zależności i nie wykonywano opisanych testów.

## Global Constraints

- „Owner chce sam tworzyć mapę, miejsca, rzeczy i ich wygląd oraz eksperymentować z tym, co się w świecie dzieje.” Pierwszy dokument jest pusty; bryły i przykłady testowe nie zastępują jego mapy.
- „Mapa i edytor mają wyprzedzać obecne laby.” Nie przyjmować formatu MiniFeniksa, wspólnego runtime, collidera ani reprezentacji ciała jako modelu autorskiej rzeczy.
- „Stan tworzonego miejsca nie zależy od życia panelu.” Kamera, układ i notatka są stanem warsztatu; Three.js i Dockview nie są właścicielami treści projektu.
- „Przyjęcie nowszego zasobu w B nie aktualizuje automatycznie A”. Nazwa, kolejność węzłów i zgodność bajtów nie rozstrzygają tożsamości autorskiej.
- „Trwałe warianty nie oznaczają obowiązku odtwarzania całego stosu undo po każdym uruchomieniu.” Historia tej sesji i zapisane warianty mają odrębne zadania.
- Zakaz uruchamiania, wznawiania i zlecania pracy Claude bez bezpośredniej prośby Ownera pozostaje w mocy. Prywatne zasoby i rozmowy pozostają poza publicznym repo.
- Pierwsze wsparcie: komputer, mysz i klawiatura, aktualna przeglądarka z WebGL2; automatyczna kwalifikacja w Chromium i ręczna próba w przeglądarce Ownera. Mobile, natywne VOX, animowane ciała i odbiorcy laboratoryjni nie należą do tego wydania.

## Review Focus

1. Duplikaty nazw oraz identyczne bajty dwóch osobno importowanych rzeczy: osobne identyfikatory i użycia, bez automatycznego scalania autorstwa — zadania 1 i 3.
2. Import kończy się po usunięciu celu albo zmianie wariantu: wynik nie trafia do bieżącego zaznaczenia — zadania 3 i 4.
3. Abort transakcji po udanym `put`, nowe zmiany podczas zapisu oraz dwie karty z tą samą generacją: poprzedni zapis pozostaje kompletny, brak fałszywego „zapisano” — zadanie 2.
4. Dach zasłania wnętrze, panel zmienia typ albo ma rozmiar zero: można odzyskać widok i cel, bez utraty treści, wycieku renderera lub obcego skrótu w polu tekstowym — zadanie 5.
5. Plik jest uszkodzony, z przyszłej wersji lub zawiera niedeklarowany brak zasobu: import nie publikuje części projektu ani nie nadpisuje istniejącej pracy — zadania 2 i 3.

## Wybory i granice pierwszego wykonania

| Obszar | Decyzja i powód |
|---|---|
| Host | Lokalna aplikacja web: jeden warsztat dostępny w używanej przeglądarce, bez konta i serwera danych. Tauri pozostaje możliwością, gdy pojawi się konkretna potrzeba dostępu do katalogów lub okien systemowych. Obecnie dołożyłoby Rust, WebView i dystrybucję bez potwierdzonej korzyści dla pierwszej sesji. |
| Renderowanie | Three.js bez React Three Fiber; jeden kontroler projektu i jawne operacje. Renderer utrzymuje odwzorowanie `PlacementId → Object3D`, nigdy odwrotnie jako jedyny zapis. Brak WebGL2 daje komunikat, bez kasowania pracy. |
| Warsztat | Dockview Community, własne typy obszarów: Miejsce, Biblioteka, Właściwości, Struktura, Notatka. Autor przestawia, dzieli, zamyka i zmienia przeznaczenie obszaru. Jedna instancja widoku 3D w pierwszym wydaniu; pozostałe widoki mogą współistnieć. Zamiana obszaru na Miejsce przenosi istniejący widok, nie tworzy drugiego właściciela sceny. |
| Zasoby | Samowystarczalne GLB glTF 2: geometria statyczna, materiały core PBR, tekstury PNG/JPEG wewnątrz pliku, alpha i `doubleSided`. Pierwszy importer odrzuca zewnętrzne URI, rozszerzenia materiałowe/kompresję, animacje i skóry z opisem ograniczenia. Niczego nie usuwa po cichu i nie pobiera zależności z sieci. |
| Skala i wybór | Układ Y-up, jednostka projektu = metr. Import pokazuje skalę i orientację; autor zatwierdza przeliczenie. Cała wybrana scena GLB jest jednym rozmieszczanym zasobem z zachowaną hierarchią wewnętrzną. Pierwsza wersja nie wydziela automatycznie „drzwi” czy „dachu” z nazw meshy. |
| Plik | `.feniks` = ZIP z `manifest.json` i `assets/<sha256>.glb`. Manifest ma `formatVersion: 1`, projekt, warsztat oraz oznaczenie kopii zapisanej albo roboczej. Obejmuje wszystkie rewizje biblioteki projektu, także jeszcze nierozmieszczone. To format tego wydania, nie ogólna ontologia Feniksa. |
| Zapis | Jawne „Zapisz” zapisuje lokalnie treść i warsztat; „Pobierz projekt” tworzy przenośną kopię. Stan „zmieniono / zapisano lokalnie / przygotowano plik” nie obiecuje archiwizacji poza profilem ani fizycznego zapisu pobrania na dysku. Nie polegać na `unload`. |
| Zakres | Bryły, własne modele, grupy, warianty i powrót. Bez systemu pluginów, fizyki, multiplayera, terenu proceduralnego ani uniwersalnego reimportu. Granice pierwszego importera i hosta nie wyznaczają przyszłych możliwości Studio. |

**Zależności do pierwszej próby instalacji:** `react/react-dom 19.3.1`, `three 0.186.1`, `dockview-react 8.5.1`, `idb 8.0.4`, `fflate 0.8.3`; developerskie `typescript 7.0.2`, `vite 8.3.4`, `@vitejs/plugin-react 6.1.2`, `vitest 5.0.5`, `@playwright/test 1.64.1`, `@types/react 19.3.0`, `@types/react-dom 19.3.0`, `@types/three 0.186.0`, `@types/node 24.19.2`. Metadane npm sprawdzono 15 października; instalacja i zgodność całego zestawu wymagają próby w zadaniu 1. Utrwalić dokładne rozwiązanie w lockfile; opcjonalny React Compiler i zależności enterprise nie są potrzebne. Ewentualna korekta wersji ma wynikać z konkretnego błędu, z odnotowaniem przyczyny.

**Dostarczenie lokalne:** `npm run dev` na `http://127.0.0.1:5173`, `npm run preview` na `http://127.0.0.1:4173`, oba z `strictPort` i bez nasłuchu LAN. Do codziennej próby używać stałego adresu preview. Różne originy mają odrębne dane przeglądarki; przenośny plik służy także do przejścia między nimi. Brak zdalnego wdrożenia w tym planie.

## Pliki i kontrakty wspólne

| Pliki | Odpowiedzialność |
|---|---|
| `src/project/types.ts`, `commands.ts`, `controller.ts` | Projekt, jawne operacje, historia treści i licznik zmian roboczych. Bez zależności od React/Three/Dockview. |
| `src/project/groups.ts`, `variants.ts` | Operacje organizacji i alternatyw, bez ukrytej podmiany rewizji. |
| `src/assets/types.ts`, `glb.ts`, `AssetImporter.tsx` | Oryginalne bajty, interpretacja importu, preflight, podgląd i przyjęcie zasobu. |
| `src/storage/types.ts`, `database.ts`, `archive.ts`, `saveCoordinator.ts` | Transakcje i generacje, kompletność zasobów, plik projektu i widoczny stan zapisu. |
| `src/viewport/WorldView.tsx`, `sceneProjection.ts`, `manipulation.ts` | Kamera, projekcja, wybór i gest przekształcenia; zwalnianie zasobów GPU. |
| `src/workspace/types.ts`, `controller.ts`, `StudioWorkspace.tsx`, `panels.tsx`, `shortcuts.ts` | Układ, cel edycji, widoczność, notatka, historia układu i routing wejścia. |
| `src/App.tsx`, `src/main.tsx`, `src/styles.css` | Uruchomienie i połączenie powyższych części; interfejs po polsku. |
| `tests/*.test.ts`, `tests/browser/*.spec.ts`, `tests/fixtures/makeGlb.ts` | Próby znaczenia operacji, rzeczywistego zapisu i drogi użytkowej; własne publiczne dane testowe. |

Dokładne granice typów, do wspólnego użycia przez zadania:

- `Id = string` tworzone przez `crypto.randomUUID()`; osobne aliasy `ProjectId`, `VariantId`, `PlacementId`, `GroupId`, `AssetId`, `RevisionId`. `Vec3 = [number, number, number]`, `Quat = [number, number, number, number]` w kolejności x/y/z/w. `Transform = {position: Vec3; rotation: Quat; scale: Vec3}`; skończone liczby, dodatnia skala. Brak cichego przycinania niepoprawnego wejścia.
- `Placement = {id: PlacementId; name: string; source: {kind: 'box'; color: string} | {kind: 'asset'; assetId: AssetId; revisionId: RevisionId}; transform: Transform}`. Bryła bazowa ma wymiar 1 × 1 × 1. Nazwy nie są kluczami.
- `Variant = {id: VariantId; name: string; placements: Record<PlacementId, Placement>; groups: Record<GroupId, {id: GroupId; name: string; memberIds: PlacementId[]}>}`. Grupy są płaskie; element należy najwyżej do jednej grupy. Przesunięcie, obrót i skala jednorodna grupy przeliczają transformacje członków wokół zamrożonego na czas gestu środka ich obwiedni. Niejednorodna skala pojedynczego elementu pozostaje dostępna; grupy nie wytwarzają nieprzedstawialnego ścinania.
- `ImportSettings = {sceneIndex: number; metersPerUnit: number; rotation: Quat}`; `AssetRevision = {id: RevisionId; assetId: AssetId; sourceName: string; blobHash: string; settings: ImportSettings}`; `AssetBlob = {hash: string; bytes: Uint8Array}`; `AssetSource = {read(hash: string): Promise<Uint8Array | null>}`. Ustawienia interpretacji są częścią niezmiennej rewizji. Hash deduplikuje bajty, nie identyfikatory autorskie. App składa źródło z nowych bajtów w pamięci oraz `readBlob` storage; renderer nie odczytuje bazy samodzielnie.
- `ProjectDocument = {formatVersion: 1; id: ProjectId; name: string; variants: Record<VariantId, Variant>; assetRevisions: Record<RevisionId, AssetRevision>}`. Brak aktywnego wariantu i obiektów renderera w dokumencie. Biblioteka zachowuje zaimportowane rewizje; automatycznego usuwania starych bajtów nie ma w tej wersji.
- `WorkspaceState = {layoutVersion: 1; layout: unknown; activeVariantId: VariantId; selection: PlacementId[]; camera: {position: Vec3; target: Vec3}; hidden: Record<VariantId, PlacementId[]>; section: {enabled: boolean; height: number}; note: string; activePanelId: string | null}`. `layout` jest walidowanym adapterem serializacji Dockview; treść i cele nie są przechowywane wyłącznie w jego komponentach. `section` to poziomy przekrój widoku, ukrywający fragmenty powyżej wysokości bez zmiany geometrii. Notatka jest jedna dla warsztatu; dwie jej prezentacje edytują ten sam tekst.
- `ProjectCommand` obejmuje dodanie, usunięcie, zmianę nazwy i transformacji elementów, grupowanie, rozgrupowanie, fork wariantu oraz jawne przyjęcie rewizji dla wskazanych użyć. `applyCommand(project: ProjectDocument, command: ProjectCommand): ProjectDocument` waliduje cele i nie mutuje wejścia. Nie zawiera komend kamery ani paneli.
- `ProjectController` udostępnia `getSnapshot()`, `subscribe(listener)`, `dispatch(command)`, `undo()`, `redo()`; snapshot zawiera `project` i monotoniczny `editRevision: number`. Gest aktualizuje podgląd, a po zakończeniu tworzy jedną operację; Escape ją odrzuca. Cofanie w tej sesji operuje treścią bez kopiowania bajtów GLB.
- `WorkSnapshot = {project: ProjectDocument; workspace: WorkspaceState; editRevision: number; workspaceEditRevision: number; newBlobs: AssetBlob[]}`; `Generations = {project: number | null; workspace: number | null}` (`null` = nowa praca). `writeWork(snapshot: WorkSnapshot, expected: Generations): Promise<SaveResult>`; `SaveResult = {kind: 'saved'; generations: Generations} | {kind: 'conflict'; scope: 'project' | 'workspace'} | {kind: 'failed'; reason: string}`.
- `LoadedWork = {project: ProjectDocument; workspace: WorkspaceState; generations: Generations; missingHashes: string[]}`; `readWork(id: ProjectId): Promise<LoadedWork | null>`. `PortableWork = {project: ProjectDocument; workspace: WorkspaceState; blobs: AssetBlob[]; kind: 'saved' | 'working-copy'}`; `encodeArchive(work: PortableWork): Promise<Blob>` i `decodeArchive(file: Blob): Promise<PortableWork>`. `createImportedWork(work: PortableWork): Promise<ProjectId>` tworzy nowy identyfikator projektu, nie nadpisuje istniejącego.

### Reguły zapisu i powrotu

Przed transakcją zamrozić kopię stanu, przygotować bajty i hashe. W jednej transakcji `readwrite` obejmującej stores `projects`, `workspaces`, `blobs` odczytać obie generacje, sprawdzić oczekiwania, zapisać brakujące bajty i oba rekordy, zwiększyć generacje. Rekord warsztatu wskazuje zapisaną generację treści. Generacje są lokalnymi, monotonicznymi metadanymi storage: nie należą do pliku i nie można przywrócić ich ze starszego eksportu. Nowo importowana praca ma nowe `ProjectId`. Zgłosić sukces dopiero po `tx.done`; w transakcji nie wykonywać importu, kompresji, fetch ani obcego `await`. Rozdzielenie rekordów służy rozdzieleniu odpowiedzialności, a przycisk Zapisz zatwierdza je atomowo. Web Locks nie jest potrzebny do poprawności.

Koordynator kolejkuje lokalne żądania zapisu. Po sukcesie pamięta, które `editRevision` i `workspaceEditRevision` zapisano; późniejsze zmiany pozostają oznaczone jako niezapisane. Konflikt nie zamienia oczekiwanej generacji na nowszą i nie ponawia nadpisania. Pozostawia stan roboczy, umożliwia pobranie jego kopii lub zapis jako nowego projektu. Zwykłe pobranie najpierw zapisuje, potem odczytuje wskazane generacje i ich niezmienne bajty; zmiana generacji przed odczytem wymaga ponownego wyboru aktualnego stanu. Kopia robocza jest jawnie oznaczona i nie udaje sukcesu lokalnego zapisu.

Odczyt obejmuje treść, warsztat i wskazane bajty w jednej transakcji `readonly`. Nie dopasowywać braków do „najnowszego modelu”: zachować identyfikator użycia, transformację i placeholder z przyczyną. Import archiwum waliduje format, cele, kompletność i hashe przed transakcją publikacji. Nieznana wersja lub niedeklarowany brak kończy import bez zmiany bazy. Eksport przy brakujących bajtach zgłasza niekompletność; nie przedstawia pliku jako samowystarczalnego. `persist()` może być dodatkiem; odmowa nie oznacza awarii importu, a zgoda nie zastępuje pliku poza profilem.

## Task 1: Autor sam przestawia rzeczy w działającym warsztacie

**Create:** `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`; `src/main.tsx`, `App.tsx`, `styles.css`; `src/project/{types,commands,controller}.ts`; `src/assets/types.ts`; `src/workspace/{types,controller}.ts`, `StudioWorkspace.tsx`, `panels.tsx`; `src/viewport/{sceneProjection,manipulation}.ts`, `WorldView.tsx`; `tests/project.test.ts`, `tests/browser/compose.spec.ts`.

**Consumes:** spec sesji A i powyższe typy. **Produces:** `applyCommand`, `ProjectController`, początkowy `WorkspaceState` oraz `createSceneProjection(scene: THREE.Scene, assets: AssetSource): {sync(project: ProjectDocument, workspace: WorkspaceState): void; dispose(): void}`. Do czasu pierwszego importu źródło zwraca brak bajtów. Powstaje widoczna aplikacja, nie osobny etap pustego scaffoldingu.

- [ ] Skonfigurować zależności, skrypty `dev`, `build`, `preview`, `typecheck`, `test`, `test:browser`; uruchomić próbę kompilacji na Node 24. Instalacja musi się udać bez wymuszania konfliktujących peer dependencies. W razie błędu poprawić konkretny zestaw i uzasadnić zmianę wersji.
- [ ] Napisać testy: dwie rzeczy o tej samej nazwie zachowują różne ID; duplikacja nadaje nowe ID; ruch/rename/undo zachowują ID; skala zero/NaN odrzucona; dziesięć ruchów podglądu i jeden koniec gestu daje jedno undo. `npm test -- --run tests/project.test.ts` ma najpierw ujawnić brak tych zachowań.
- [ ] Zaimplementować dokument, kontroler i komendy podstawowe. Udostępnić pustą pracę, dodawanie bryły, wybór kliknięciem/listą, duplikację/usuwanie, nazwę, pozycję/obrót/skalę w inspektorze i manipulatorze oraz undo/redo.
- [ ] Połączyć obok siebie Miejsce, Bibliotekę i Właściwości/Strukturę w Dockview. Kamera autora: orbit/pan/zoom i ustawienie na zaznaczenie. Projekt pozostaje poza komponentami paneli; wyłączenie widoku zwalnia jego zasoby. Styl jest spokojny i czytelny; użytkowe narzędzia zajmują pierwszeństwo przed dekoracją.
- [ ] `npm run typecheck`, `npm run build`, test jednostkowy i `npm run test:browser -- tests/browser/compose.spec.ts`: przez UI dodać dwie bryły, zmienić jedną manipulatorem, drugą polami, cofnąć ruch i anulować kolejny Escape. Ocenić także faktyczne trafianie w cel i czytelność stanu, nie tylko wartości w pamięci.
- [ ] Sprawdzić diff i utrwalić samodzielny rezultat w commicie `feat: compose and edit a place in the studio workspace`.

## Task 2: Zapis, plik i powrót od pierwszej kompozycji

**Create:** `src/storage/{types,database,archive,saveCoordinator}.ts`; `tests/archive.test.ts`, `tests/browser/persistence.spec.ts`, `tests/browser/storage-failures.spec.ts`. **Modify:** `src/App.tsx`, `src/workspace/controller.ts`, `src/workspace/panels.tsx`, `README.md`.

**Consumes:** `ProjectController`, `WorkspaceState`. **Produces:** `writeWork`, `readWork`, `encodeArchive`, `decodeArchive`, `createImportedWork` według wspólnych kontraktów oraz `readBlob(hash: string): Promise<Uint8Array | null>`; UI tworzenia/otwierania/nazywania pracy i zapisu kopii. Metody kontrolera warsztatu: `getSnapshot()`, `subscribe(listener)`, `setState(next)`; snapshot zawiera `workspace` i `workspaceEditRevision`.

- [ ] Napisać próby archiwum: drugi projekt importowany z pliku dostaje nowe `ProjectId`, zachowuje ID wewnętrzne; przyszła wersja, błędny hash, brak wpisu i ścieżki inne niż manifest/oczekiwane zasoby nie publikują pracy. Uruchomić `npm test -- --run tests/archive.test.ts` przed implementacją.
- [ ] Zaimplementować atomiczny zapis dwóch generacji, kolejkę i kontrolę zapisanych liczników, zgodnie z regułami wyżej. Dodać osobny stan zmienionej treści/warsztatu, błędu i konfliktu; przy błędzie nie usuwać roboczego stanu.
- [ ] Zaimplementować kodowanie i walidację samowystarczalnego pliku, pobranie przez zwykły download oraz wybór pliku do importu. Nie wymagać File System Access API. Kopia robocza przy konflikcie/awarii korzysta z zamrożonego stanu i oryginalnych bajtów, z jawnym oznaczeniem w manifeście.
- [ ] W prawdziwym IndexedDB sprawdzić: abort po udanym `put` pozostawia poprzedni komplet; edycja podczas zapisu pozostaje dirty; dwie karty startujące z tymi samymi generacjami dają dokładnie jeden sukces i jeden konflikt, również przy różnicy wyłącznie warsztatu, bez Web Locks. Awarię quota symulować na granicy storage; nie udawać, że jest rzeczywistym zapełnieniem dysku.
- [ ] `npm run test:browser -- tests/browser/persistence.spec.ts tests/browser/storage-failures.spec.ts`: zapisać bryły i kamerę, zamknąć kartę, otworzyć pracę ponownie; pobrać plik, zaimportować w nowym kontekście przeglądarki z pustą bazą i odzyskać treść. UI musi pokazać prawdziwy wynik każdej operacji.
- [ ] Utrwalić działającą drogę z zapisem i przeniesieniem: `feat: save and recover portable studio work`.

## Task 3: Własny model przechodzi całą drogę do zapisanej pracy

**Create:** `src/assets/glb.ts`, `AssetImporter.tsx`, `tests/fixtures/makeGlb.ts`, `tests/assets.test.ts`, `tests/browser/assets.spec.ts`. **Modify:** `src/assets/types.ts`, `src/project/commands.ts`, `src/viewport/sceneProjection.ts`, `src/workspace/panels.tsx`, `src/storage/archive.ts`.

**Consumes:** `AssetRevision`, `AssetBlob`, zapis i renderer z poprzednich zadań. **Produces:** `preflightGlb(bytes: Uint8Array): GlbPreflight`, gdzie `GlbPreflight = {ok: true; scenes: {index: number; name: string}[]} | {ok: false; reason: string}`; `prepareImport(bytes: Uint8Array, sourceName: string, settings: ImportSettings, assetId?: AssetId): Promise<{revision: AssetRevision; blob: AssetBlob}>`. Wymiary wyznacza podgląd po bezpiecznym parsowaniu modelu. Nowy import tworzy `AssetId`; jawne „Nowa rewizja” przyjmuje konkretny `assetId`, zawsze z nowym `RevisionId`.

- [ ] Przygotować własne małe GLB testowe z kilkoma meshami, teksturą PNG, alpha MASK i dwustronnością, bez kopiowania prywatnych zasobów. Próby `tests/assets.test.ts`: zewnętrzne URI nie wywołują fetch; nieobsługiwana cecha jest nazwana; podwójny import tych samych bajtów daje dwa `AssetId`; interpretacja i bytes są niezmienne. Najpierw uruchomić i zobaczyć brak wymaganych zachowań.
- [ ] Zbudować preflight przed `GLTFLoader.parseAsync`, podgląd sceny i potwierdzenie skali/orientacji. Zachować oryginalne bajty; nie wypalać transformacji rozmieszczenia w zasób. Materialność fizyczna nie wynika z materiału PBR ani obwiedni.
- [ ] Dodać import do Biblioteki, rozmieszczanie, picking całego użycia, placeholder brakującej rewizji/bajtu oraz zwalnianie cache/GPU przy zamknięciu pracy. Import do Biblioteki nie rozmieszcza automatycznie modelu w aktualnym zaznaczeniu. Każde działanie asynchroniczne niesie utrwalony projekt/cel; usunięty lub zastąpiony cel anuluje zastosowanie wyniku.
- [ ] `npm run test:browser -- tests/browser/assets.spec.ts`: model z teksturą → dwa użycia → transformacje → eksport → pusty kontekst → import i widok obu użyć. Zweryfikować wizualnie fakturę, otwory alpha, stronność i orientację; same hashe tego nie dowodzą. Wymuszony brak bajtów po load pozostawia ID i transformację placeholdera; późny import nie modyfikuje innego wybranego elementu.
- [ ] Wykonać dodatkową lokalną próbę na istniejącym GLB z geometrią i osadzonymi teksturami; ścieżkę przekazać przez `STUDIO_PRIVATE_ASSET`, bez commitu pliku. Odczytany kandydat ma 829076 B, 54 węzły, 51 meshy, 5 materiałów i 3 PNG; to techniczny materiał kontrolny, nie dowód autorstwa Ownera lub gotowy workflow MagicaVoxel. Faktyczny własny model Ownera pozostaje późniejszą próbą użytkową. Utrwalić wynik: `feat: bring static glb assets into portable studio projects`.

## Task 4: Grupy i alternatywy zachowują decyzje autora

**Create:** `src/project/groups.ts`, `variants.ts`, `tests/variants.test.ts`, `tests/browser/variants.spec.ts`. **Modify:** `src/project/commands.ts`, `src/viewport/manipulation.ts`, `src/workspace/panels.tsx`, `src/assets/AssetImporter.tsx`.

**Consumes:** projekt, rewizje, komendy i archiwum. **Produces:** `forkVariant(project: ProjectDocument, sourceId: VariantId, name: string): {project: ProjectDocument; variantId: VariantId}` i `replaceRevision(project: ProjectDocument, variantId: VariantId, placementIds: PlacementId[], revisionId: RevisionId): ProjectDocument`. Fork zachowuje wewnętrzne ID elementów w osobnym wariancie; cel użycia zawsze jest parą `(variantId, placementId)`.

- [ ] Testy: zgrupowanie nie przemieszcza członków; ruch/obrót/jednorodna skala zachowują względny układ; undo przywraca wszystkie transformacje; usunięcie/rozgrupowanie nie zostawia martwych odwołań. A używa `r1`, B po jawnym wyborze używa `r2`, a oryginalne bajty `r1` pozostają dostępne. Uruchomić `npm test -- --run tests/variants.test.ts` przed implementacją.
- [ ] Dodać płaskie nazwane grupy, wybór członka lub całości oraz manipulator grupy zgodny z kontraktem. Zmiana nazwy nie zmienia członkostwa. Po komendzie, undo i zmianie wariantu warsztat waliduje aktywny wariant oraz zaznaczenie; zniknięcie bieżącego wariantu wybiera istniejący i czyści niepoprawne cele. Test obejmuje undo utworzenia aktywnego wariantu.
- [ ] Dodać nazwany fork, wybór wariantu i jawne przyjęcie nowej rewizji dla wybranych użyć tego samego `AssetId`. Przed zatwierdzeniem pokazać podgląd i zakres. Wynik wczytania `r2` dla B nie może przepiąć A po zmianie aktywnego wariantu; nie dopasowywać części modelu po nazwach/indeksach.
- [ ] `npm run test:browser -- tests/browser/variants.spec.ts`: utworzyć A/B, zmienić kompozycję i rewizję tylko w B, pobrać, otworzyć w pustej bazie, obejrzeć oba warianty i ich różnice. Błąd próby sprawdzić przez undo, a powrót po uruchomieniu przez zapisany wariant. Commit: `feat: preserve grouped compositions and pinned variants`.

## Task 5: Autor odzyskuje swój warsztat i dostęp do wnętrza

**Create:** `src/workspace/shortcuts.ts`, `tests/workspace.test.ts`, `tests/browser/workspace.spec.ts`. **Modify:** `src/workspace/{types,controller}.ts`, `StudioWorkspace.tsx`, `panels.tsx`, `src/viewport/WorldView.tsx`, `src/styles.css`.

**Consumes:** niezależne kontrolery treści/warsztatu i zapis. **Produces:** `setPanelKind(panelId: string, kind: PanelKind)`, `undoLayout()`, `redoLayout()` na kontrolerze warsztatu; `PanelKind = 'world' | 'library' | 'inspector' | 'structure' | 'note'`. Layout history przechowuje wyłącznie układ/przeznaczenie obszarów; nie cofa notatki, treści ani późniejszego wyboru wariantu.

- [ ] Napisać testy: zmiana typu obszaru nie kopiuje treści; zamknięcie wszystkich paneli pozostawia możliwość „Dodaj obszar” i odzyskania Miejsca; dwa inspektory/notatki pokazują ten sam cel/tekst; uszkodzony layout uruchamia bezpieczny układ z zachowaniem projektu i notatki. `npm test -- --run tests/workspace.test.ts` najpierw ujawnia brak tych zachowań.
- [ ] Dodać dzielenie, przenoszenie, rozmiar, otwieranie/zamykanie i wybór typu obszaru. Stan ważny dla autora trzymać poza montowaniem komponentu. Przy niewidocznym/zerowym widoku zatrzymać rysowanie; po powrocie przeliczyć rozmiar. Nie zakładać, że tryb `always` Dockview sam zatrzyma RAF.
- [ ] Dodać ukryj/pokaż/izoluj i „Pokaż wszystko” oraz włączany poziomy przekrój widoku z regulacją wysokości. Przekrój odsłania środek także przy dachu wewnątrz pojedynczego modelu; nie rozcina zasobu, nie tworzy nowych rzeczy i nie przycina manipulatora. Picking pomija przecięcia w niewidocznym fragmencie. Struktura pozwala odzyskać ukryte rzeczy; „Pokaż wszystko” wyłącza też przekrój.
- [ ] Oddzielić undo treści, przyciski undo/redo układu i natywną edycję tekstu. Skróty 3D działają przy focusie widoku; Delete/Undo w Notatce lub polu inspektora nie usuwa ani nie cofa obiektu. Zapisać aktywny cel, wariant, kamerę, ukrycia, przekrój, układ i notatkę.
- [ ] `npm run test:browser -- tests/browser/workspace.spec.ts`: ułożyć przejście, odizolować środek i poprawić go; następnie włączyć przekrój modelu z dachem i wybrać osobną rzecz wewnątrz — odcięty dach nie przechwytuje kliknięcia, wyłączenie przekroju przywraca pełny model. Zmienić Bibliotekę na Właściwości; przebudować układ, przesunąć rzecz, cofnąć układ — rzecz zostaje przesunięta. Zamknąć i odzyskać wszystko po zapisie. Ręcznie sprawdzić zmniejszone okno, sterowanie myszą i focus. Commit: `feat: compose and recover the author workspace`.

## Task 6: Cała sesja staje się dostępna do prawdziwej próby

**Create:** `tests/browser/first-session.spec.ts`, `docs/first-session.md`. **Modify:** `README.md` i tylko miejsca ujawnionych błędów.

**Consumes:** wszystkie wcześniejsze możliwości. **Produces:** uruchamialny build i krótki opis wejścia dla Ownera, z linkiem do rzeczywistego serwera po uruchomieniu; wynik kwalifikacji odróżniony od jego oceny produktu.

- [ ] Połączyć drogę: pusta praca → własny GLB/bryły → kompozycja z wysokością i przejściem → grupa → poprawka → A/B i nowa rewizja → przebudowa warsztatu/notatka → zapis/pliki → zamknięcie → powrót i dalsza edycja. `npm run test:browser -- tests/browser/first-session.spec.ts` ma przechodzić przez publiczne UI; hooki są do kontrolowanych awarii, nie zastępują gestów użytkownika.
- [ ] Wykonać raz pełne właściwe sprawdzenie: `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run test:browser`. Zbadać błędy konsoli i ekran po powrocie; zachować screenshoty/trace niepowodzeń w ignorowanej `.local/`. Ponawiać po zmianach lub wykrytej wątpliwości, nie dla samego powtarzania PASS.
- [ ] Zmierzyć na zapisanym sprzęcie/przeglądarce czas importu, powrotu i reakcję manipulacji przy 10/100/1000 kopiach modelu kontrolnego. Jeśli zasoby lub płynność zawodzą, zapisać granicę i przyczynę; nie deklarować skali świata na podstawie liczby testów i nie narzucać sztucznego limitu projektu zamiast wyjaśnienia.
- [ ] Uruchomić lokalny preview i otworzyć go w panelu Codex. Instrukcja dla Ownera ma wystarczyć do utworzenia własnego miejsca, zapisania i późniejszego otwarcia; testowy układ pozostaje tylko fixture. Druga samodzielna kompozycja Ownera i jego chęć powrotu są osobnym, jeszcze niezaliczonym sprawdzianem produktu.
- [ ] Zapisać wyniki i rzeczywiste ograniczenia, przeprowadzić końcowy przegląd zmian, utrwalić `docs: qualify the first studio authoring session`. Dalszy kierunek wynika z używania, nie z automatycznego dopisywania reszty Feniksa do tego planu.

## Wykonanie i samoprzegląd planu

Prowadzenie i integracja pozostają u Astry. Po ocenie planu prace mogą wykonywać upoważnieni agenci: Sol 6.1 dla spójnych zadań implementacyjnych, Luna 6 dla ograniczonych fixture/prób oraz niezależnego sprawdzenia konkretnych kontraktów. Przy zadaniach zależnych przekazywać zaakceptowany interfejs i commit poprzednika; nie zlecać równoległych edycji tych samych plików. Kolejny agent ma dostarczać kod albo rozstrzygający sprawdzian, nie następną ogólną opinię. Drugi czat Studio wniósł analizę zapisu i konfliktu dwóch kart; nie jest to wykonany test.

Samoprzegląd: sesja 1 → zadania 1/3; sesja 2 → 1/4; wnętrze → 5 z przekrojem widoku także dla nierozdzielnego modelu; A/B → 4; komponowanie obszarów → 5; powrót → 2/6. Wszystkie pięć Review Focus ma przypisane próby. Dokument nie przydziela labom, rendererowi ani bibliotece paneli władzy nad autorską treścią. Najwcześniejsza pełna droga z własnym modelem powstaje po zadaniu 3; warianty i swobodny warsztat domykają zadania 4–5. Weryfikacja wykonania pozostaje przed nami.

## Źródła decyzji technicznych — odczyt 15 października 2026

- [Dockview: funkcje](https://dockview.dev/docs/core/overview/), [Community/MIT](https://dockview.dev/docs/overview/licence/), [życie niewidocznych paneli](https://dockview.dev/docs/core/panels/rendering/).
- [Three.js: GLTFLoader](https://threejs.org/docs/pages/GLTFLoader), [TransformControls](https://threejs.org/docs/pages/TransformControls), [wymaganie WebGL2](https://threejs.org/docs/pages/WebGLRenderer).
- [IndexedDB: harmonogram transakcji, W3C Editor's Draft](https://w3c.github.io/IndexedDB/#transaction-scheduling), [MDN: zakończenie i abort](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [idb: czas życia transakcji](https://github.com/jakearchibald/idb).
- [MDN: trwałość danych przeglądarki](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [ograniczenia showSaveFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker).
- [Tauri: architektura](https://v2.tauri.app/concept/architecture/), [Vite: wymagania Node](https://vite.dev/guide/). Wersje pakietów sprawdzono w metadanych ich wpisów w oficjalnym rejestrze npm; nie jest to wynik instalacji.
