# Steps done

## 1. Run format script to commit formatted code

## 2. Install Husky:

Cursor > Composer > Prompt: "Install husky and create a pre-push hook to execute the following scripts: format, lint, check-types, test and build (in this order)."

Reason: replaces temporarely the need of a CI flow (like GHA)

## 3. Create NextJS application:

Cursor > Composer > Prompt "Create a Nextjs application inside /apps folder and with typescript and tailwind"

Command executed:
npx create-next-app@latest web --typescript --tailwind --no-eslint --app --no-src-dir --import-alias "@/\*"

## 4. Generate context explanation toa accelerate domain comprehension

Cursor > Composer > Prompt "Generate a markdown explaining the domain entities, their relationships, with examples and diagrams".

## 5. Added initial architecture of components & some backend changes to implement the desired UX

**Disclaimer: I have ignored on purpose:**

- I didn't commit every single step like in a real project. In a real project I usually start with a big component and I break it into smaller ones, and I do a component with tests, then I move to the next one, etc. The approach here has been different because I was understanding the domain at the same time I was implementing.
- Localization: all strings are hardcoded. If there would be translations requirements, I would use a LLM to find and replace every text of the UI to use React INTL or similar.
- Magic strings: with more time, I would move magic strings like status types to a constants.ts file in a \_shared folder.
- All possible edge-cases in all components. I have tried to cover basic ones.
- Auth: Different user/roles to submit a plan and to receive approval has been ignored on purpose. Probably we should have different users with differnt roles to let a manager approve a plan. This has been ignored to ignore this complexity for now, but I would probably suggest to use an OAuth2.0 flow (probably Auth Code + PKCE) with OIDC to have a JWT token with a role claim (that would be check in the "approval" operation in the API, to check the opration has been done by a manager user).
- SSR has been ignored on prupose because it appears to be an user-related / private flow that doesn't has SEO requirements (this is an assumption and should be checke with the team and the PM).
- I have ignoted the possibility of multiple currencies on purpose for simplify, but this should be checked with the team and the PM in a real project (or if you don't have these roles based on user needs or expansion business strategy).
- I didn't look for a perfect solution, I have tried to show my way of work and way of thinking about how to structure UIs in React + Typescript.
- I have created tests only in the EstimatesManagement feature components to showcase my testing skills.
- I have disable limting checks in the web project due to time constrain. I would NEVER do this in a real project.
- In a real project I would have added testing code coverage checks in the CI, security scans (with snyk or similar), code maintainability scans (like code climate or similar), etc.
- I have fixed some last-minute bugs with cursor LLMs and I would have to refactor more the code generated, but skipped it because of time constrains.
- I would love to have more time to provide better feedback to the user when submits a plan.

**Some design/architecture decisions:**

- I have left routing logic inside NextJs "page" files. This deocuples React components from NextJS routing logic (it would make easier to migrate to Remix, a vanilla React SPA, or others.)
- All requests to the backend API has been migrated to react-query. Reason: it allows to manage entities caching logic, invalidation/refresh logic, etc. It's simple and straightforward including them inside custom hooks, using it as a pattern.
- I have contibruted a couple of reusable components inside the web/components/ui folder:
  - Button: is suposed to provide an example of an atom component of the design system components. It's not used everwhere but I have tried to use it in a few components.
  - Card: it's an example of a molecule components of the design system.
  - VenueSkeleton: it's an example of an iconography atom component. (But if you look at the implementation It would make more sense to have isolated the <svg> from the div and classes, which I would implement in a real project)
- Atoms components are only to showcase my way of thinking about these components, we should have a complete library with all reusable atoms if possible.
- I have decided to use tailwind for styles because LLMs comprehend properly the structure. This has allowed me to accelerate UI implementation.
- I have contributed a cursor command to `create-tests` to accelerate my tests creation using cursor models/LLMs.

**Some code repository & code organization decisions:**

- The structure of the UI (the DOM elements in the browser) is reflected into the organization of folders inside the web/components architecture. Instead of using a components classification approach or a fractal organizational style, I preferred this approach becase it simplifies project comprehension, scales properly (allowed me to have very small components with concrete responsibilities and easy to maintain and evolve, easy to test also), you don't need cognitive charge to understand and jump between folders, etc. Simply: parent components has children components, so parent folder component has children folder components.
- Every component has a folder `ComponentName`, a file `ComponentName.tsx` and the tests are close to the code following collocation code organization approach. In general, constants, functions, hooks, etc are close to the usage, simplifying comprehension, maintainability and refactoring (if you move a folder to another part of he structure you will move almost all relevant files). This make the file structure more flexinle and easy to refactor and scale.
- In the future, if the custom hooks are reused

**Some UX decisions**

- I decided to start with a List of plans to let the user create a new one or modify an existing one.
- When there is an update/create operation, we do a transition to the "Event Estimate Builder", which is a wizard that allows the use discover all the functionality / complexity in simple steps that organizes the concepts for them.
- The status of the plan is saved on DB on each step. This is done on purpose in order to allow "abandoned cart" flows for instance sending an email to the user to continue witht he plan configuration.
- The customer journey provide feedback about where the user is, the pending steps, etc. And they have a summary to observer the economical impact of their decisions.
- The user can go back to the existing estimates whenever they want.
- If they edit a plan, they can see the what they selected and update their selections.

**Some other things I would add with more time:**

- Playwright tests for e2e test testing only critical-business paths and happy paths (smoke test cases). Probably I would consider also testing https://www.stagehand.dev/ to make e2e tests more resilient letting an LLM extract and select components in the UI.
- I would generate the the openapi.yml file to be used to generate the clients automatically with a library like `orval`.
- I would probably invest more time on react-query configuration adding retries, circuit breakers, caching config, invalidations, etc.
