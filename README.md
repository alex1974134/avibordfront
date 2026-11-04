# AivibeBoard

Фронтенд-прототип рабочего пространства с AI. Доска живёт в сессии браузера. Вход и регистрация идут через Supabase Auth.

Без сессии открывается только страница входа. Подробности — в `docs/session.md`.

Скопируйте `.env.example` в `.env.local` и заполните адрес проекта и publishable key. Файл `.env.local` в git не входит.

```bash
npm install
npm run dev
```

Проверка сборки:

```bash
npm run build
```
