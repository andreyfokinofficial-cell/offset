# OFFSET — Netlify + Markdown

Минималистичное онлайн-издание. Netlify отвечает только за публикацию сайта, GitHub — за статьи и изображения.

## Где находятся статьи

Все публикации лежат здесь:

`content/articles/*.md`

Один Markdown-файл = одна статья.

## Быстрая публикация новой статьи через GitHub

1. Откройте репозиторий на GitHub.
2. Перейдите в `content/articles`.
3. Нажмите **Add file → Create new file**.
4. Назовите файл, например `sluzhenie.md`.
5. Скопируйте структуру из `ARTICLE-TEMPLATE.md`.
6. Заполните заголовок, slug, дату, рубрику, preview и текст.
7. Нажмите **Commit changes**.
8. Netlify автоматически пересоберёт сайт.

## Редактирование статьи

Откройте нужный `.md` в `content/articles`, нажмите **Edit this file** (карандаш), измените текст и сделайте commit.

## Изображения

Загружайте файлы в:

`public/images/`

Обложка статьи:

`featureImage: "/images/my-image.jpg"`

Изображение внутри текста:

`![Описание](/images/my-image.jpg "Подпись")`

## Черновики

В front matter статьи поставьте:

`draft: true`

Такая статья не попадёт в сборку сайта. Для публикации измените на:

`draft: false`

## Netlify

Настройки уже находятся в `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Node: 22

Никакой Visual Editor не требуется.
