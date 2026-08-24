# OFFSET — публикация в Netlify

## Вариант 1 — рекомендуемый: сайт + редактирование

1. Создайте пустой репозиторий на GitHub.
2. Распакуйте `OFFSET-Netlify-source.zip` и загрузите все файлы в репозиторий.
3. В Netlify выберите **Add new project → Import an existing project → GitHub**.
4. Выберите репозиторий OFFSET.
5. Настройки сборки уже находятся в `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. После первого deploy откройте **Project configuration → Visual Editor** и настройте Preview environment.
7. Для редактирования: **Visual Editor → Content → Articles**.

Каждая статья имеет поля: заголовок, URL-slug, дата, рубрика, короткое превью, картинка, описание картинки и основной текст Markdown.

## Вариант 2 — самый быстрый: только публикация

Распакуйте `OFFSET-Netlify-deploy.zip` и перетащите папку/файлы в Netlify Drop или Manual deploy.

Этот вариант сразу публикует сайт, но не даёт редактировать статьи через Visual Editor, потому что Visual Editor работает с Git-репозиторием.

## Добавление изображений

Изображения находятся в `public/images/`. В статье можно использовать Markdown:

`![Подпись](/images/my-image.jpg "Комментарий к изображению")`

## Демонстрационные статьи

Четыре статьи в `content/articles/` — примеры для проверки дизайна. Их можно удалить или заменить после подключения редактора.
