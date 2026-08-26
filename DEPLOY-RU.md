# OFFSET: работа после перехода на Markdown

## Разовая миграция существующего GitHub-репозитория

Если в репозитории уже установлена старая JSON-версия OFFSET:

1. Удалите старые файлы `content/articles/*.json`.
2. Удалите `stackbit.config.ts` — он больше не нужен.
3. Замените `scripts/build.mjs` новым файлом из этого пакета.
4. Замените `package.json`.
5. Загрузите новые `.md`-файлы из `content/articles/`.
6. Оставьте `netlify.toml`, `public/`, `scripts/dev.mjs` и остальные файлы проекта.
7. Сделайте commit в `main`.

Netlify автоматически запустит новую сборку.

## Новая статья

GitHub → `content/articles` → **Add file → Create new file**.

Например: `sluzhenie.md`.

Используйте `ARTICLE-TEMPLATE.md`.

## Изменить статью

GitHub → `content/articles` → нужный `.md` → карандаш **Edit this file** → **Commit changes**.

## Добавить изображение

GitHub → `public/images` → **Add file → Upload files**.

После загрузки используйте путь `/images/имя-файла.jpg`.
