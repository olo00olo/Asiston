W celu uruchomienia aplikacji wymagane jest następujące oprogramowanie:
- https://git-scm.com/downloads
- https://dotnet.microsoft.com/download
- https://nodejs.org/en
- https://www.postgresql.org/download/.

Następnie należy sklonować repozytorium: https://github.com/olo00olo/Asiston i w pliku appsettings.Development.json ustawić dane do połączenia z bazą danych.
W podfolderze .\Asiston\ należy zainstalować zależności: dotnet restore, utworzyć migracje bazy danych: dotnet ef database update, a następnie uruchomić backend: dotnet run.
Teraz w folderze .\frontend\ zainstalować zależności reacta: npm install, a następnie uruchomić aplikację: npm start. Aplikacja domyślnie powinna uruchomić się pod adresem: http://localhost:3000.
