# Bachelorette Quiz

A reusable public template for a hosted bachelorette party quiz. The template includes placeholder content only, so private couple details can be added later in a separate private repo.

The quiz flow is:

1. Play an intro video from the host.
2. Ask the bride or group a question.
3. Check a multiple-choice or text answer.
4. Show whether the answer was correct.
5. If the answer is wrong, pause for the shot prompt.
6. Reveal the groom's answer video.
7. Continue until the final score screen.

## Public Template Workflow

Keep this repo public and free of private couple information:

- Do not commit real names, private stories, personal questions, or final videos here.
- Use placeholder questions and placeholder video paths in this template.
- Create a new private repo from this template for each couple or event.
- Add the real quiz content and videos only in the private repo.

When the public GitHub repo is ready, enable template mode in GitHub:

1. Open the repository on GitHub.
2. Go to `Settings`.
3. Enable `Template repository`.
4. Use `Use this template` to create the private event repo.

## Run Locally

```sh
npm install
npm run dev
```

## Add Your Real Content

In the private event repo, update the quiz content in `src/data/quiz.ts`.

For multiple-choice questions:

```ts
{
  id: 'q1',
  type: 'multipleChoice',
  question: 'Where was our first date?',
  options: ['Cafe', 'Beach', 'Cinema', 'Restaurant'],
  correctAnswer: 'Cafe',
  groomVideo: '/videos/q1-answer.mp4',
}
```

For text-input questions:

```ts
{
  id: 'q2',
  type: 'text',
  question: 'What nickname do I call her most?',
  acceptedAnswers: ['sunshine', 'my sunshine'],
  displayAnswer: 'Sunshine',
  groomVideo: '/videos/q2-answer.mp4',
}
```

Put videos in `public/videos/`:

- `intro.mp4` for your explanation video.
- `q1-answer.mp4`, `q2-answer.mp4`, etc. for the groom's answer videos.

If the app cannot find a video yet, it shows a placeholder with the missing file path.

## Deploy As A Link

This is a static Vite site, so it can be hosted on Vercel, Netlify, or GitHub Pages.

For Vercel or Netlify:

1. Push the private event repo to GitHub.
2. Import the project.
3. Use `npm run build` as the build command.
4. Use `dist` as the publish/output folder.

Before the party, open the hosted link on the exact device they will use and test every video with sound.
