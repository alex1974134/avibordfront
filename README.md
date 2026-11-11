# AivibeBoard

Фронтенд рабочего пространства с задачами, досками и AI. Вход и регистрация — Supabase Auth (роль IT-команды в metadata). Доски и задачи на сохранённых проектах пишутся в Supabase; демо-проекты из `data/` остаются в сессии браузера.

**AI (облако):** на обзоре — лайв-чат с контекстом; на странице доски — всплывающий помощник, который разбивает цель на задачи и назначает их по ролям участников. Вызовы идут в Edge Function `openrouter` (модель OpenRouter `openai/gpt-6-luna`). **Раздел `/ai`** по-прежнему использует локальный черновик без сети.

Подробности по экранам, миграциям и настройке секрета OpenRouter — в [`docs/session.md`](docs/session.md).

Скопируйте [`.env.example`](.env.example) в `.env.local` и заполните URL и publishable key Supabase.

```bash
npm install
npm run dev
```

Проверка сборки:

```bash
npm run build
```

Миграции БД: [`supabase/migrations/`](supabase/migrations/). Исходник Edge Function: [`supabase/functions/openrouter/`](supabase/functions/openrouter/). После деплоя функции задайте в проекте секрет `OPENROUTER_API_KEY`.
