# Tworzywo — rozbierz, złóż, użyj

Eksperyment Feniks Studio, 19–20 października 2026. Z istniejącego modelu można wyjąć balkon, zachować go jako własną konstrukcję, wstawiać kolejne egzemplarze i zmieniać ich wnętrze niezależnie. Celem jest zwiększenie możliwości autora korzystającego z posiadanej grafiki.

To **natywne okno w przypiętej Jaskini v6.3**, z jej importerem, sceną i manipulatorem. Eksperyment nie zmienia opublikowanej Jaskini, nie integruje starszego dokumentu `feniks-place` i nie ustala formatu przyszłego świata. Korzysta z `Jaskinia.ext.type`, `materialy.import/object` i `swiat.stage/three`. Host: `Jozz-Cave-Workbench@dd47f3253dbcf522b4cd671c794599d32cbe79b9`.

## Spróbuj

1. Otwórz uruchomiony podgląd i wybierz **Modele próbne**. Powstaną dwa syntetyczne modele: warsztat oraz mechaniczny nosiciel. Można też dodać statyczny `.bbmodel` z osadzonymi teksturami.
2. W drzewie wybierz **Balkon**, następnie **Odłącz**. Zmieni się przynależność, a wygląd i miejsce pozostaną takie same.
3. Zaznacz części przez Shift/Ctrl i użyj **Połącz**. Nazwij nową całość. **Przesuń / Obróć / Skala** działają przez manipulator w scenie.
4. Wybierz **Zachowaj część**, potem dwa razy **Wstaw**. Wybierz balustradę jednego egzemplarza i przesuń ją. Drugi egzemplarz pozostanie bez zmian. **Cofnij** obejmuje cały gest.
5. **Zapisz plik** zapisuje pracę; **Plik części** zapisuje samą konstrukcję i jej potrzebne źródła. W nowej instancji wybierz **Otwórz pracę**. `demo-kram.json` to gotowy, syntetyczny wynik próby.

Egzemplarze są niezależnymi kopiami receptury. Zmiana jednego nie aktualizuje pozostałych ani bibliotecznej receptury. To jawna polityka tej próby, nie rozstrzygnięcie przyszłych połączeń i wariantów.

## Uruchomienie i odtworzenie

Wymagane: Node 22+, Git i klon publicznego `Jozzpoly/Jozz-Cave-Workbench` zawierający przypięty commit. Skrypt czyta `git show SHA:dist/jaskinia-web.html`; nie zmienia checkoutu hosta.

```powershell
# W folderze tego eksperymentu:
npm install
$env:JASKINIA_REPO='C:/path/to/Jozz-Cave-Workbench'
npm test
npm start
# W drugim terminalu, gdy serwer już wypisał adres:
npx playwright install chromium
npm run test:browser
```

`npm run build` tworzy samodzielny `tworzywo-probe.html`. Serwer domyślnie wybiera wolny port localhost i zapisuje adres w `server.json`; `PORT` pozwala utrzymać ten sam origin między sesjami. Lokalny zapis przeglądarki jest związany z originem.

Można wykorzystać istniejące zależności przez `ESBUILD_PACKAGE` i `PLAYWRIGHT_PACKAGE` (ścieżki do `package.json` odpowiedniego środowiska). `CHROMIUM_PATH` wskazuje istniejący plik wykonywalny przeglądarki. Nie są potrzebne konta, klucze API ani zasoby autora.

## Co sprawdzono

`core.test.mjs`: 6 testów rdzenia. `verify.mjs`: rzeczywisty importer, syntetyczne tekstury i 39 elementów, klikanie drzewa, składanie, manipulacja wskaźnikiem, undo/redo, pobranie JSON, otwarcie w czystym profilu oraz ponowne otwarcie strony. Dodatkowo instrumentowane trudne macierze, odrzucenie skali zerowej i granice liczby części/źródeł. Dokładne wyniki są w `verification.json`.

Największy błąd współrzędnych przy trudnym przepięciu wyniósł około `2.7e-15`; transport pliku odtworzył bez różnicy 4914 obserwowanych współrzędnych, UV i źródła tekstur. Podstawienie zmienionego modelu o tej samej nazwie nie podmieniło konstrukcji. Nieprawidłowy hash źródła odmówił zastąpienia bieżącego dokumentu.

Początkowa próba zatrzymywała się na `download.saveAs: canceled`. Minimalna kontrola bez kodu Jaskini odtworzyła to samo w Windows sandboxie. Ten sam Chromium poza sandboxem pobrał plik i przeszedł pełną ścieżkę. Testy używają odrębnych profili i blokują żądania poza localhost. Nie ingerują w profile użytkownika. Dwa oczekiwane komunikaty błędu pochodzą z celowego odrzucenia nieprawidłowych operacji; nie są nieobsłużonymi wyjątkami strony.

## Granice wyniku i decyzje do recenzji

- **To próba jednej pracy w jednej karcie.** Okna współdzielą dokument eksperymentu; wybór projektu w powłoce nie przełącza go. Brak uzgodnienia równoległych zapisów kart, produkcyjnego odzyskiwania po błędnym starcie i wspólnej transakcji biblioteki hosta z dokumentem. Doświadczenie nie jest gotowe do integracji jako trwały edytor produktu.
- **Macierze nie są językiem twórczym.** Grupy wybiera się głównie z drzewa, manipulator obraca wokół środka zaznaczenia, a skala zmienia także grubość elementów. Nie ma rozciągania przęsła z zachowaniem grubości słupków ani edycji topologii. To istotne pytania użytkowe, nie drobne braki matematyki.
- **Przepis jest zależny od interpretacji źródła.** Używa hashy bajtów i ścieżek w drzewie importera. Pin hosta jawnie odrzuca inną wersję; nie stanowi migracji. Dla przyszłej aktualizacji importera trzeba odtworzyć tożsamość części albo świadomie utrwalić wynik w nowym źródle.
- **Plik części zawiera całe wymagane modele źródłowe**, także niewybrane elementy i ich tekstury. Zapewnia samowystarczalność tej próby, ale nie minimalny rozmiar ani selektywne udostępnianie.
- **Grupa jest konstrukcją graficzną.** Nie oznacza automatycznie pojemnika, fizycznego stawu, ciała czy działającego przedmiotu. Animowane modele są odrzucane; inne formaty nie są tu obsługiwane.
- Limity próby: 5000 węzłów dokumentu, 100 receptur, 30 źródeł, 12 MB tekstu jednego modelu. Nie testowano telefonu, własnych assetów autora ani pełnych regresji Jaskini. Zielone sprawdzenia nie zastępują oceny wygody i feelingu.

**Najcenniejszy następny eksperyment:** dwa wizualnie takie same modele z innym podziałem wewnętrznym; ta sama przebudowa wykonana bez pisania kodu. Zmierzyć, co autor musi rozpoznać i ile czynności wykonać. To może rozstrzygnąć, czy Studio powinno pozwalać wyznaczać własne części ponad strukturą importu. Nie wymaga jeszcze uniwersalnego schematu przedmiotów, fizyki ani nowej powłoki.

Przy integracji warto oddzielnie ocenić: rdzeń przekształceń, receptury i tożsamość części, dostępne gesty oraz zapis. Przyjęcie jednej z tych rzeczy nie wymusza przyjęcia pozostałych. Kod i wszystkie modele demonstracyjne tej próby są przeznaczone do recenzji i dalszej przebudowy.
