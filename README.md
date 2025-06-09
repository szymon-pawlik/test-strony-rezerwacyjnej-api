
## 🏡 Strona Rezerwacyjna - Full-Stack API

Strona Rezerwacyjna to zaawansowany projekt full-stack, który symuluje w pełni funkcjonalną platformę do rezerwacji mieszkań. Aplikacja została zbudowana w architekturze zorientowanej na usługi, z rozbudowanym backendem w technologii ```.NET 8```.


## 🚀Demo

![image](https://github.com/user-attachments/assets/c126ff6b-7ad6-482a-8dbc-14fefc616a0d)

![image](https://github.com/user-attachments/assets/f980328f-6af8-4eaf-b57e-0337cc5b34f0)


## 🚀 O Projekcie
Celem projektu było stworzenie skalowalnej i bezpiecznej platformy rezerwacyjnej, która obejmuje kompletny cykl interakcji użytkownika – od rejestracji, przez przeglądanie i rezerwowanie ofert, aż po komunikację z administracją. Aplikacja demonstruje implementację wielu nowoczesnych wzorców i technologii, takich jak uwierzytelnianie oparte na tokenach JWT, komunikacja przez REST i GraphQL oraz separacja logiki na backendzie.
![image](https://github.com/user-attachments/assets/01e646b3-314d-4a4c-9a6f-e2844ef85677)

## ✨ Kluczowe Funkcje (Features)
Dla Użytkowników
- System Uwierzytelniania: Bezpieczna rejestracja i logowanie (JWT).

- Przeglądanie Ofert: Dostęp do listy dostępnych mieszkań z filtrowaniem i wyszukiwaniem.

- System Rezerwacji: Możliwość rezerwowania mieszkań na wybrane terminy.

- Profil Użytkownika: Zarządzanie własnymi danymi i historią rezerwacji.

- Recenzje i Oceny: Możliwość dodawania opinii do mieszkań.

- System Ticketowy: Formularz kontaktowy do wysyłania zapytań do administracji.

Dla Administratora
- Panel Administracyjny: Dedykowany interfejs do zarządzania platformą.

- Zarządzanie Ofertami: Dodawanie, edycja i usuwanie mieszkań.

- Obsługa Ticketów: Przeglądanie i odpowiadanie na zapytania od użytkowników.

- Zarządzanie Użytkownikami: Pełna kontrola nad kontami użytkowników.
## 🛠️ Stos Technologiczny (Tech Stack)
Backend
- Framework: ```.NET 8```

- API: ```REST API & GraphQL```

- ORM: ```Entity Framework Core 8```

- Baza Danych: ```SQLite```

- Uwierzytelnianie: ```JSON Web Tokens (JWT)```

- Dokumentacja API: ```Swagger (OpenAPI)```

![image](https://github.com/user-attachments/assets/022928e2-f837-42c3-919c-db3b536fabff)

![image](https://github.com/user-attachments/assets/da2bbe80-c0b6-4234-aba4-6eb101648874)


Frontend
- Język: ```TypeScript```

- Struktura: Niestandardowa SPA (Single Page Application)

- Własny system routingu i zarządzania stanem

- Style: ```SCSS```

- Bundler: ```Webpack``` i ```Vite```

## 🏛️ Architektura
Aplikacja została zaprojektowana z myślą o skalowalności. Backend jest podzielony na logiczne serwisy, które komunikują się ze sobą, realizując architekturę zbliżoną do mikroserwisów. Każdy serwis jest odpowiedzialny za konkretną domenę biznesową (np. użytkownicy, rezerwacje, mieszkania).

Komunikacja między frontendem a backendem odbywa się głównie przez REST API. Dodatkowo, zaimplementowano endpoint GraphQL do elastycznego i wydajnego pobierania danych.
## ⚙️ Uruchomienie Lokalne (Run Locally)
### Backend:

Przejdź do folderu BackendApp.

Przywróć zależności .NET:

```dotnet restore```

Zastosuj migracje do bazy danych:

```dotnet ef database update```

Uruchom serwer:

```dotnet run```

Serwer będzie dostępny pod adresem https://localhost:XXXX, a dokumentacja Swagger pod https://localhost:XXXX/swagger.

### Frontend
Przejdź do folderu ClientApp.

Zainstaluj zależności:

```npm install```

Uruchom aplikację kliencką:

```npm start```
## ✍️ Autorzy (Authors)
[Szymon Pawlik](https://github.com/szymon-pawlik) - Twórca projektu
